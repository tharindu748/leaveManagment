import {
  BadGatewayException,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { SyncHistoryService } from '../sync-history/sync-history.service';
import { AttendanceService } from '../attendance/attendance.service';
import Digest from 'request-digest';
import { Direction, Source } from '@prisma/client';
import { PunchesService } from '../punches/punches.service';
import { DeviceCredentialsDto } from './dto/device.dto';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';

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

  async fetchUsersFromDevice() {
    if (!this.credentials) throw new BadGatewayException('Credentials not set');
    const { ip, username, password } = this.credentials;
    const digestRequest = Digest(username, password);
    const url = '/ISAPI/AccessControl/UserInfo/Search?format=json';
    const searchData = {
      UserInfoSearchCond: {
        searchID: '1',
        searchResultPosition: 0,
        maxResults: 2000,
      },
    };

    return new Promise((resolve, reject) => {
      digestRequest.request(
        {
          host: ip,
          path: url,
          port: 80,
          method: 'POST',
          json: true,
          body: searchData,
          headers: { 'Content-Type': 'application/json' },
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res.body);
        },
      );
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
    const { ip, username, password } = this.credentials;
    const digestRequest = Digest(username, password);
    const url = '/ISAPI/AccessControl/AcsEvent?format=json';
    const acsEventCond = {
      searchID: 'poll1',
      searchResultPosition: 0,
      maxResults: 10,
      major: 5,
      minor: 0,
      ...(this.lastEventTime ? { startTime: this.lastEventTime } : {}),
    };
    const cond = { AcsEventCond: acsEventCond };

    if (this.lastEventTime) cond.AcsEventCond.startTime = this.lastEventTime;

    let data;
    try {
      const res = await new Promise((resolve, reject) => {
        digestRequest.request(
          {
            host: ip,
            path: url,
            port: 80,
            method: 'POST',
            json: true,
            body: cond,
            headers: { 'Content-Type': 'application/json' },
          },
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });
      data = (res as any).body;
    } catch (e) {
      console.error('Polling error:', e);
      return;
    }

    const acs = data.AcsEvent || {};
    const statusStr = acs.responseStatusStrg || 'UNKNOWN';
    if (!['OK', 'MORE'].includes(statusStr) || !acs.InfoList) return;

    const events = acs.InfoList;
    let newMaxTime = this.lastEventTime;
    let insertedEmployees = new Set<string>();
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
        direction: direction,
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
    // Recalc attendance for affected employees
    const workDate = new Date().toISOString().slice(0, 10); // Assume current day, or extract from events
    for (const empId of insertedEmployees) {
      await this.attendanceService.calculateAttendance({
        employeeId: empId,
        workDate,
      });
    }
  }
}
