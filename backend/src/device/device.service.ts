// src/device/device.service.ts
import {
  BadGatewayException,
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import { SyncHistoryService } from '../sync-history/sync-history.service';
import { AttendanceService } from '../attendance/attendance.service';
import { PunchesService } from '../punches/punches.service';
import { DeviceCredentialsDto } from './dto/device.dto';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import { Direction } from '@prisma/client';
import { DeviceConfigService } from './device-config.service';

@Injectable()
export class DeviceService implements OnModuleDestroy {
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(
    private usersService: UsersService,
    private syncHistoryService: SyncHistoryService,
    private punchesService: PunchesService,
    private attendanceService: AttendanceService,
    private prisma: DatabaseService,
    private deviceConfig: DeviceConfigService,
  ) {}

  onModuleDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  async setCredentials(creds: DeviceCredentialsDto) {
    await this.deviceConfig.save(creds);
    return { status: 'ok' };
  }

  private async getClient() {
    return this.deviceConfig.getClient();
  }

  private async handleAuthError(error: any) {
    if (error.status === 401 || error.statusCode === 401) {
      await this.deviceConfig.markAuthFailure();
      console.warn(
        'Device authentication failed - marking failure and blocking future attempts',
      );
    }
    throw error;
  }

  private async withAuthRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    // Check if auth is currently blocked
    const authStatus = await this.deviceConfig.isAuthBlocked();
    if (authStatus.blocked) {
      throw new BadGatewayException(authStatus.reason);
    }

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        // If successful, clear any previous auth failures
        await this.deviceConfig.clearAuthFailure();
        return result;
      } catch (error: any) {
        if (error.status === 401 || error.statusCode === 401) {
          if (i === maxRetries - 1) {
            await this.handleAuthError(error);
          }
          continue;
        }
        throw error;
      }
    }
    throw new Error(`withAuthRetry: failed after ${maxRetries} retries`);
  }

  async fetchUsersFromDevice() {
    return this.withAuthRetry(async () => {
      const { ip } = await this.deviceConfig.getOrThrow();
      const client = await this.getClient();
      const url = `http://${ip}/ISAPI/AccessControl/UserInfo/Search?format=json`;
      const searchData = {
        UserInfoSearchCond: {
          searchID: '1',
          searchResultPosition: 0,
          maxResults: 2000,
        },
      };
      const res = await client.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });
      if (res.status === 401)
        throw new UnauthorizedException('Device auth failed');
      if (!res.ok)
        throw new BadGatewayException(`Device responded ${res.status}`);
      return res.json();
    });
  }

  async syncUsers() {
    // Check auth status before attempting sync
    const authStatus = await this.deviceConfig.isAuthBlocked();
    if (authStatus.blocked) {
      const status = `Sync blocked: ${authStatus.reason}`;
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }

    let usersData: any;
    try {
      usersData = await this.fetchUsersFromDevice();
    } catch (e: any) {
      const status = `Error: ${e.message ?? e}`;
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }

    if (!usersData?.UserInfoSearch) {
      const status = 'Invalid data received';
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }

    const userList = usersData.UserInfoSearch.UserInfo ?? [];
    const totalMatches = usersData.UserInfoSearch.totalMatches ?? 0;

    if (!Array.isArray(userList) || userList.length === 0) {
      const status = 'No users found';
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }

    let newCount = 0,
      updatedCount = 0;
    for (const user of userList) {
      const empId = user.employeeNo;
      if (!empId) continue;
      const name = user.name || 'N/A';
      const cardList = user.UserCardList || user.RightList || [];
      const cardNo = cardList.length ? cardList[0].cardNo || 'N/A' : 'N/A';
      const validInfo = user.Valid || {};
      const validFrom = validInfo.beginTime || undefined;
      const validTo = validInfo.endTime || undefined;
      const existing = await this.prisma.user.findUnique({
        where: { employeeId: empId },
      });
      await this.usersService.upsertRegUser({
        employeeId: empId,
        name,
        cardNumber: cardNo,
        validFrom,
        validTo,
      });
      if (existing) updatedCount++;
      else newCount++;
    }

    const status = 'Success';
    await this.syncHistoryService.addRecord({
      totalUsers: totalMatches,
      newUsers: newCount,
      updatedUsers: updatedCount,
      status,
    });
    return {
      total: totalMatches,
      new: newCount,
      updated: updatedCount,
      status,
    };
  }

  startPolling() {
    if (this.pollingInterval) return { status: 'already running' };
    this.pollingInterval = setInterval(() => {
      this.pollEvents().catch((err) => {
        console.error('pollEvents unhandled error:', err);
        // never let this bubble and kill the process
      });
    }, 5000);
    return { status: 'started' };
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    return { status: 'stopped' };
  }

  async getAuthStatus() {
    const authStatus = await this.deviceConfig.isAuthBlocked();
    return authStatus;
  }

  async clearAuthFailures() {
    await this.deviceConfig.clearAuthFailure();
    return { status: 'Auth failures cleared' };
  }

  private async pollEvents() {
    // Check auth status before polling
    const authStatus = await this.deviceConfig.isAuthBlocked();
    if (authStatus.blocked) {
      console.log(`Polling skipped: ${authStatus.reason}`);
      return;
    }

    let creds: any;
    try {
      creds = await this.deviceConfig.getOrThrow();
    } catch {
      return;
    }

    const client = await this.getClient();
    const url = `http://${creds.ip}/ISAPI/AccessControl/AcsEvent?format=json`;
    const cond: any = {
      AcsEventCond: {
        searchID: 'poll1',
        searchResultPosition: 0,
        maxResults: 10,
        major: 5,
        minor: 0,
      },
    };

    const lastEventTime = await this.deviceConfig.getLastEventTime();
    if (lastEventTime) {
      cond.AcsEventCond.startTime = lastEventTime;
      const offset = lastEventTime.slice(19);
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hour = now.getHours().toString().padStart(2, '0');
      const min = now.getMinutes().toString().padStart(2, '0');
      const sec = now.getSeconds().toString().padStart(2, '0');
      cond.AcsEventCond.endTime = `${year}-${month}-${day}T${hour}:${min}:${sec}${offset}`;
    }

    let data: any;
    try {
      const res = await client.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cond),
      });

      if (res.status === 401) {
        await this.deviceConfig.markAuthFailure();
        console.warn(
          'Device authentication failed - marking failure and blocking future attempts',
        );
        return;
      }

      if (!res.ok) {
        console.error('Polling error: Device responded', res.status);
        return;
      }

      data = await res.json();
      await this.deviceConfig.clearAuthFailure();
    } catch (e: any) {
      if (
        e.status === 401 ||
        e.statusCode === 401 ||
        e.cause?.code === 'UND_ERR_CONNECT_TIMEOUT'
      ) {
        await this.deviceConfig.markAuthFailure();
        console.warn(
          'Device authentication failed - marking failure and blocking future attempts',
        );
        return;
      } else {
        console.error('Polling error:', e);
      }
      return;
    }

    const acs = data?.AcsEvent ?? {};
    const statusStr = acs.responseStatusStrg ?? 'UNKNOWN';
    if (!['OK', 'MORE'].includes(statusStr) || !acs.InfoList) return;

    const events = acs.InfoList as any[];
    let newMaxTime = lastEventTime;
    const affected = new Set<string>();

    for (const ev of events) {
      const empId = ev.employeeNoString;
      if (!empId) continue;

      const raw = ev.time as string | undefined;
      if (!raw) continue;
      const eventTimeDate = new Date(raw);

      if (Number.isNaN(eventTimeDate.getTime())) continue;

      const att = (ev.attendanceStatus as string | undefined) ?? 'Unknown';
      let direction: Direction | undefined = undefined;
      const a = att.toLowerCase();

      if (a.includes('checkin') || a.includes('in')) direction = Direction.IN;
      else if (a.includes('checkout') || a.includes('out'))
        direction = Direction.OUT;

      const row = await this.punchesService.insertPunch({
        employeeId: empId,
        eventTime: raw,
        direction,
        source: 'device',
      } as any);

      if (row) {
        affected.add(empId);
      }
      if (raw && (!newMaxTime || raw > newMaxTime)) newMaxTime = raw;
    }

    if (newMaxTime && newMaxTime !== lastEventTime) {
      await this.deviceConfig.setLastEventTime(newMaxTime);
    }

    const nowUtc = new Date();
    const workDate = nowUtc.toISOString().slice(0, 10);
    for (const empId of affected) {
      await this.attendanceService.calculateAttendance({
        employeeId: empId,
        workDate,
      });
    }
  }
}
