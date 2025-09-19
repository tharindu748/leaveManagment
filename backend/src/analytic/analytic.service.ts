import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

type SummaryParams = {
  start?: string;
  end?: string;
  employeeId?: string;
};

type TopParams = {
  start?: string;
  end?: string;
  limit?: number;
};

type SummaryRow = {
  id: number;
  name: string;
  late: number;
  workingDays: number;
};

@Injectable()
export class AnalyticService {
  constructor(private readonly database: DatabaseService) {}

  async getEmployeeWorkSummary(params: SummaryParams): Promise<SummaryRow[]> {
    const { start, end, employeeId } = params;
    const { startDate, endDateExclusive } = this.resolveDateRange(start, end);
    const latestConfig = await this.database.attendanceConfig.findFirst({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
    const workStartSeconds = this.timeOfDayToSeconds(
      latestConfig?.workStart ?? new Date(2000, 0, 1, 9, 0, 0),
    );
    const users = await this.database.user.findMany({
      where: {
        active: true,
        employeeId: { not: null },
        ...(employeeId ? { employeeId } : {}),
      },
      select: { id: true, name: true, employeeId: true },
      orderBy: { id: 'asc' },
    });
    if (users.length === 0) {
      return [];
    }
    const allEmployeeIds = users
      .map((u) => u.employeeId)
      .filter((v): v is string => Boolean(v));
    const attendance = await this.database.attendanceDay.findMany({
      where: {
        employeeId: { in: allEmployeeIds },
        workDate: {
          gte: startDate,
          lt: endDateExclusive,
        },
      },
      select: {
        employeeId: true,
        workDate: true,
        firstIn: true,
        workedSeconds: true,
      },
    });
    const byEmp: Record<string, typeof attendance> = {};
    for (const row of attendance) {
      if (!byEmp[row.employeeId]) byEmp[row.employeeId] = [];
      byEmp[row.employeeId].push(row);
    }
    const summary: SummaryRow[] = users.map((u) => {
      const rows = u.employeeId ? (byEmp[u.employeeId] ?? []) : [];
      const workingDays = rows.reduce(
        (acc, r) => acc + (r.workedSeconds > 0 ? 1 : 0),
        0,
      );
      const late = rows.reduce((acc, r) => {
        const fi = (r.firstIn ?? '').trim();
        if (!fi) return acc;
        const firstInSeconds = this.parseClockStringToSeconds(fi);
        return acc + (firstInSeconds > workStartSeconds ? 1 : 0);
      }, 0);
      return {
        id: u.id,
        name: u.name,
        late,
        workingDays,
      };
    });
    return summary;
  }

  async getMostLateEmployees(params: TopParams): Promise<SummaryRow[]> {
    const { start, end, limit } = params;
    let summary = await this.getEmployeeWorkSummary({ start, end });
    summary = summary.filter((s) => s.workingDays > 0);
    summary = summary.sort(
      (a, b) => b.late - a.late || a.workingDays - b.workingDays || a.id - b.id,
    );
    const lim = limit ?? 5;
    return summary.slice(0, lim);
  }

  async getLeastLateEmployees(params: TopParams): Promise<SummaryRow[]> {
    const { start, end, limit } = params;
    let summary = await this.getEmployeeWorkSummary({ start, end });
    summary = summary.filter((s) => s.workingDays > 0);
    summary = summary.sort(
      (a, b) => a.late - b.late || b.workingDays - a.workingDays || a.id - b.id,
    );
    const lim = limit ?? 5;
    return summary.slice(0, lim);
  }

  private parseClockStringToSeconds(clock: string): number {
    const parts = clock.split(':').map((p) => p.trim());
    if (parts.length < 2 || parts.length > 3) return 0;
    const [hStr, mStr, sStr] = parts;
    const h = Number(hStr);
    const m = Number(mStr);
    const s = sStr !== undefined ? Number(sStr) : 0;
    if (
      Number.isNaN(h) ||
      Number.isNaN(m) ||
      Number.isNaN(s) ||
      h < 0 ||
      h > 23 ||
      m < 0 ||
      m > 59 ||
      s < 0 ||
      s > 59
    )
      return 0;
    return h * 3600 + m * 60 + s;
  }

  private timeOfDayToSeconds(d: Date): number {
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  private resolveDateRange(
    start?: string,
    end?: string,
  ): { startDate: Date; endDateExclusive: Date } {
    const now = new Date();
    let startDate: Date;
    let endDateInclusive: Date;
    if (start) {
      startDate = new Date(start + 'T00:00:00');
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }
    if (end) {
      endDateInclusive = new Date(end + 'T00:00:00');
    } else {
      endDateInclusive = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );
    }

    const endDateExclusive = new Date(endDateInclusive);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
    return { startDate, endDateExclusive };
  }

  async getDailySummary(dateStr: string) {
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);

    const activeEmployees = await this.database.user.findMany({
      where: { active: true, employeeId: { not: null } },
      select: { employeeId: true },
    });
    const totalActive = activeEmployees.length;
    const activeEmployeeIds = new Set(
      activeEmployees.map((u) => u.employeeId as string),
    );

    if (totalActive === 0) {
      return [
        { title: 'Present', percentage: 0, count: 0 },
        { title: 'Absent', percentage: 0, count: 0 },
        { title: 'On Time', percentage: 0, count: 0 },
        { title: 'Late', percentage: 0, count: 0 },
      ];
    }

    const latestConfig = await this.database.attendanceConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!latestConfig) {
      throw new Error('No AttendanceConfig found. Please create one.');
    }

    const workStartOnDay = this.applyTimeOfDay(dateStr, latestConfig.workStart);

    type FirstInRow = { employeeId: string; firstIn: Date };
    const firstIns: FirstInRow[] = await this.database.$queryRawUnsafe(
      `
        SELECT
          employee_id AS "employeeId",
          MIN(COALESCE(correct_event_time, event_time)) AS "firstIn"
        FROM punches
        WHERE direction = 'IN'
          AND COALESCE(correct_event_time, event_time) >= $1
          AND COALESCE(correct_event_time, event_time) <  $2
        GROUP BY employee_id
      `,
      start,
      end,
    );

    const presentMap = new Map<string, Date>();
    for (const row of firstIns) {
      if (activeEmployeeIds.has(row.employeeId)) {
        presentMap.set(row.employeeId, new Date(row.firstIn));
      }
    }

    const presentCount = presentMap.size;
    const absentCount = totalActive - presentCount;

    let onTimeCount = 0;
    for (const [_emp, firstIn] of presentMap) {
      if (firstIn <= workStartOnDay) onTimeCount++;
    }
    const lateCount = presentCount - onTimeCount;

    const pct = (n: number) => Math.round((n * 100 * 100) / totalActive) / 100;

    const result = [
      {
        title: 'Present',
        percentage: Math.round(pct(presentCount)),
        count: presentCount,
      },
      {
        title: 'Absent',
        percentage: Math.round(pct(absentCount)),
        count: absentCount,
      },
      {
        title: 'On Time',
        percentage: Math.round(pct(onTimeCount)),
        count: onTimeCount,
      },
      {
        title: 'Late',
        percentage: Math.round(pct(lateCount)),
        count: lateCount,
      },
    ];

    return result;
  }

  private applyTimeOfDay(dateStr: string, timeSource: Date): Date {
    const hours = timeSource.getUTCHours();
    const minutes = timeSource.getUTCMinutes();
    const seconds = timeSource.getUTCSeconds();
    const ms = timeSource.getUTCMilliseconds();

    const d = new Date(`${dateStr}T00:00:00.000Z`);
    d.setUTCHours(hours, minutes, seconds, ms);
    return d;
  }
}
