import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

type SummaryParams = {
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  employeeId?: string; // users.employee_id
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

  /**
   * Business logic:
   * - workingDays: number of AttendanceDay rows with workedSeconds > 0 in the period
   * - late: number of days where firstIn (HH:mm or HH:mm:ss) is later than AttendanceConfig.workStart (time-of-day)
   * Notes:
   * - Uses the latest AttendanceConfig row (by updatedAt or createdAt).
   * - Date range: [start, end] inclusive on dates (midnight boundaries).
   * - Defaults to month-to-date if no start/end provided.
   */
  async getEmployeeWorkSummary(params: SummaryParams): Promise<SummaryRow[]> {
    const { start, end, employeeId } = params;

    const { startDate, endDateExclusive } = this.resolveDateRange(start, end);

    // Get latest attendance config (for workStart time-of-day)
    const latestConfig = await this.database.attendanceConfig.findFirst({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    // Default 09:00 if no config exists yet
    const workStartSeconds = this.timeOfDayToSeconds(
      latestConfig?.workStart ?? new Date(2000, 0, 1, 9, 0, 0),
    );

    // Get users (active) — optionally filter by employeeId
    const users = await this.database.user.findMany({
      where: {
        active: true,
        ...(employeeId ? { employeeId } : {}),
      },
      select: { id: true, name: true, employeeId: true },
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) {
      return [];
    }

    // Pull all attendance rows for these employeeIds within the range in ONE go
    const allEmployeeIds = users
      .map((u) => u.employeeId)
      .filter((v): v is string => Boolean(v));

    const attendance = await this.database.attendanceDay.findMany({
      where: {
        employeeId: { in: allEmployeeIds },
        workDate: {
          gte: startDate,
          lt: endDateExclusive, // end is inclusive (we made exclusive by adding 1 day)
        },
      },
      select: {
        employeeId: true,
        workDate: true,
        firstIn: true, // string: "HH:mm" or "HH:mm:ss"
        workedSeconds: true,
      },
    });

    // Group by employeeId for fast lookup
    const byEmp: Record<string, typeof attendance> = {};
    for (const row of attendance) {
      if (!byEmp[row.employeeId]) byEmp[row.employeeId] = [];
      byEmp[row.employeeId].push(row);
    }

    // Build response
    const summary: SummaryRow[] = users.map((u) => {
      const rows = u.employeeId ? (byEmp[u.employeeId] ?? []) : [];

      const workingDays = rows.reduce(
        (acc, r) => acc + (r.workedSeconds > 0 ? 1 : 0),
        0,
      );

      const late = rows.reduce((acc, r) => {
        const fi = (r.firstIn ?? '').trim();
        if (!fi) return acc;

        const firstInSeconds = this.parseClockStringToSeconds(fi); // fallback 0 if parse fails
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

  // ---- helpers ----

  /**
   * Turn "HH:mm" or "HH:mm:ss" into seconds since midnight. Returns 0 if invalid.
   */
  private parseClockStringToSeconds(clock: string): number {
    // Allow "9:05" "09:05" "09:05:30"
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

  /**
   * Extract seconds since midnight from a Date's local time-of-day.
   * (Assumes the time part is what matters; date portion is ignored.)
   */
  private timeOfDayToSeconds(d: Date): number {
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  /**
   * Resolve [start, end] date range at day precision, inclusive.
   * Produces startDate @ 00:00 and endDateExclusive = (end + 1 day) @ 00:00.
   * Defaults to month-to-date.
   */
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

    // end exclusive = end + 1 day
    const endDateExclusive = new Date(endDateInclusive);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
    return { startDate, endDateExclusive };
  }
}
