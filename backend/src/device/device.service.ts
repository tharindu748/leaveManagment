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

  // Persist credentials once
  async setCredentials(creds: DeviceCredentialsDto) {
    await this.deviceConfig.save(creds);
    return { status: 'ok' };
  }

  private async getClient() {
    return this.deviceConfig.getClient();
  }

  private async withAuthRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (
          (error.status === 401 || error.statusCode === 401) &&
          i < maxRetries - 1
        ) {
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

  // Same contract, but now fully DB-config backed and error-safe
  async syncUsers() {
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
    this.pollingInterval = setInterval(() => this.pollEvents(), 5000);
    return { status: 'started' };
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    return { status: 'stopped' };
  }

  private async pollEvents() {
    // Read config + lastEventTime from DB
    let creds;
    try {
      creds = await this.deviceConfig.getOrThrow();
    } catch {
      // not configured yet
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
    if (lastEventTime) cond.AcsEventCond.startTime = lastEventTime;

    let data: any;
    try {
      const res = await client.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cond),
      });
      if (res.status === 401)
        throw new UnauthorizedException('Device auth failed');
      if (!res.ok) {
        // Log & back off, but do not crash the loop
        console.error('Polling error: Device responded', res.status);
        return;
      }
      data = await res.json();
    } catch (e) {
      console.error('Polling error:', e);
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

      const raw = ev.time as string | undefined; // e.g. "2025-09-15T14:12:00+05:30"
      const normalized = raw ? raw.slice(0, 19).replace('T', ' ') : ''; // "YYYY-MM-DD HH:MM:SS"
      const eventTime = normalized ? new Date(normalized) : null;
      if (!eventTime || Number.isNaN(eventTime.getTime())) continue;

      const att = (ev.attendanceStatus as string | undefined) ?? 'Unknown';
      let direction: Direction | undefined = undefined;

      const a = att.toLowerCase();
      if (a.includes('checkin') || a.includes('in')) direction = Direction.IN;
      else if (a.includes('checkout') || a.includes('out'))
        direction = Direction.OUT;
      // else: leave undefined → PunchesService will auto-infer from history

      const row = await this.punchesService.insertPunch({
        employeeId: empId,
        eventTime: normalized,
        direction, // may be undefined → auto-infer
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

    // Recalculate attendance for the affected employees for *today* (same as Python worker).
    const workDate = new Date().toISOString().slice(0, 10);
    for (const empId of affected) {
      await this.attendanceService.calculateAttendance({
        employeeId: empId,
        workDate,
      });
    }
  }
}
