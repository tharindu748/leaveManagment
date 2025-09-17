import {
  BadGatewayException,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { SyncHistoryService } from '../sync-history/sync-history.service';
import { AttendanceService } from '../attendance/attendance.service';
import { PunchesService } from '../punches/punches.service';
import { DeviceCredentialsDto } from './dto/device.dto';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import DigestFetch from 'digest-fetch';
import { Direction } from '@prisma/client';

@Injectable()
export class DeviceService implements OnModuleDestroy {
  private credentials: DeviceCredentialsDto | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastEventTime: string | null = null;

  constructor(
    private usersService: UsersService,
    private syncHistoryService: SyncHistoryService,
    private punchesService: PunchesService,
    private attendanceService: AttendanceService,
    private prisma: DatabaseService,
  ) {}

  onModuleDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  setCredentials(creds: DeviceCredentialsDto) {
    this.credentials = creds;
  }

  private getClient() {
    if (!this.credentials) throw new BadGatewayException('Credentials not set');
    const client = new DigestFetch(
      this.credentials.username,
      this.credentials.password,
    );

    // Add custom options if needed
    return client;
  }

  private async withAuthRetry(requestFn: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.status === 401 && i < maxRetries - 1) {
          console.log('Authentication failed, retrying with new client...');
          continue;
        }
        throw error;
      }
    }
  }

  async fetchUsersFromDevice() {
    return this.withAuthRetry(async () => {
      if (!this.credentials)
        throw new BadGatewayException('Credentials not set');
      const { ip } = this.credentials;
      const client = this.getClient(); // Get fresh client
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

      if (!res.ok) throw new Error(`Device responded ${res.status}`);
      return await res.json();
    });
  }

  async syncUsers() {
    let usersData;
    try {
      usersData = await this.fetchUsersFromDevice();
    } catch (e) {
      const status = `Error: ${e.message}`;
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }
    if (!usersData || !usersData.UserInfoSearch) {
      const status = 'Invalid data received';
      await this.syncHistoryService.addRecord({
        totalUsers: 0,
        newUsers: 0,
        updatedUsers: 0,
        status,
      });
      throw new BadGatewayException(status);
    }

    const userList = usersData.UserInfoSearch.UserInfo || [];
    const totalMatches = usersData.UserInfoSearch.totalMatches || 0;
    if (!userList.length) {
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
    if (!this.credentials) return;
    const { ip } = this.credentials;
    const client = this.getClient();
    const url = `http://${ip}/ISAPI/AccessControl/AcsEvent?format=json`;

    const acsEventCond: any = {
      searchID: 'poll1',
      searchResultPosition: 0,
      maxResults: 10,
      major: 5,
      minor: 0,
    };
    if (this.lastEventTime) {
      acsEventCond.startTime = this.lastEventTime;
    }
    const cond = { AcsEventCond: acsEventCond };

    let data: any;
    try {
      const res = await client.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cond),
      });
      if (!res.ok) {
        console.error('Polling error: Device responded', res.status);
        return;
      }
      data = await res.json();
    } catch (e) {
      console.error('Polling error:', e);
      return;
    }

    const acs = data.AcsEvent || {};
    const statusStr = acs.responseStatusStrg || 'UNKNOWN';
    if (!['OK', 'MORE'].includes(statusStr) || !acs.InfoList) return;

    const events = acs.InfoList;
    let newMaxTime = this.lastEventTime;
    const insertedEmployees = new Set<string>();

    for (const event of events) {
      const empId = event.employeeNoString;
      if (!empId) continue;

      const rawTime = event.time;
      const normalizedTimeStr = rawTime
        ? rawTime.slice(0, 19).replace('T', ' ')
        : '';
      const normalizedTime = new Date(normalizedTimeStr);
      if (isNaN(normalizedTime.getTime())) continue;

      const attendanceStatus = event.attendanceStatus || 'Unknown';
      let direction: Direction = Direction.IN;
      if (
        attendanceStatus.toLowerCase().includes('checkin') ||
        attendanceStatus.toLowerCase().includes('in')
      ) {
        direction = Direction.IN;
      } else if (
        attendanceStatus.toLowerCase().includes('checkout') ||
        attendanceStatus.toLowerCase().includes('out')
      ) {
        direction = Direction.OUT;
      }

      const row = await this.punchesService.insertPunch({
        employeeId: empId,
        eventTime: normalizedTimeStr,
        direction,
        source: 'device',
      });
      if (row) {
        insertedEmployees.add(empId);
      }
      if (rawTime && (!newMaxTime || rawTime > newMaxTime)) {
        newMaxTime = rawTime;
      }
    }

    if (newMaxTime && newMaxTime !== this.lastEventTime) {
      this.lastEventTime = newMaxTime;
    }

    const workDate = new Date().toISOString().slice(0, 10);
    for (const empId of insertedEmployees) {
      await this.attendanceService.calculateAttendance({
        employeeId: empId,
        workDate,
      });
    }
  }
}
