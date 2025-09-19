import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AttendanceDay,
  AttendanceStatus,
  Direction,
  Source,
} from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CalculateAttendanceDto } from './dto/attendance.dto';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto';

type GetMonthRecordsParams = {
  month: string; // "YYYY-MM"
  employeeIds?: string[]; // optional filter
  timezone: string; // e.g., "Asia/Colombo"
};

type GetDaySnapshotParams = {
  date: string; // "YYYY-MM-DD"
  employeeIds?: string[]; // optional filter
  timezone: string;
};

@Injectable()
export class AttendanceService {
  constructor(private prisma: DatabaseService) {}

  async findAttendanceDay(employeeId: string, workDate: string) {
    try {
      const wd = new Date(workDate);
      return this.prisma.attendanceDay.findUnique({
        where: { employeeId_workDate: { employeeId, workDate: wd } },
      });
    } catch (e) {
      throw new BadRequestException('Invalid date');
    }
  }

  async findAllAttendanceUser(employeeId: string) {
    try {
      return await this.prisma.attendanceDay.findMany({
        where: { employeeId },
        orderBy: { workDate: 'desc' },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAttendanceConfig() {
    const config = await this.prisma.attendanceConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!config) {
      throw new BadRequestException('Attendance config not set');
    }
    return config;
  }

  async updateAttendanceConfig(dto: UpdateAttendanceConfigDto) {
    // Convert to Date with dummy date
    const parse = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return new Date(Date.UTC(1970, 0, 1, h, m));
    };

    const existing = await this.prisma.attendanceConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.prisma.attendanceConfig.update({
        where: { id: existing.id },
        data: {
          workStart: parse(dto.workStart),
          workEnd: parse(dto.workEnd),
          otEnd: parse(dto.otEnd),
          earlyStart: parse(dto.earlyStart),
        },
      });
    } else {
      return this.prisma.attendanceConfig.create({
        data: {
          workStart: parse(dto.workStart),
          workEnd: parse(dto.workEnd),
          otEnd: parse(dto.otEnd),
          earlyStart: parse(dto.earlyStart),
        },
      });
    }
  }

  async calculateAttendance(
    dto: CalculateAttendanceDto,
    persistNormalization: boolean = true,
  ) {
    const { employeeId, workDate } = dto;
    const d = new Date(workDate);
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid workDate');

    const dayStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
    );

    const cfg = await this.getAttendanceConfig();
    // ✅ Fix: Use getUTCHours() and getUTCMinutes() to extract intended local hours without timezone shift
    const workStartH = cfg.workStart.getUTCHours();
    const workStartM = cfg.workStart.getUTCMinutes();
    const workEndH = cfg.workEnd.getUTCHours();
    const workEndM = cfg.workEnd.getUTCMinutes();
    const otEndH = cfg.otEnd.getUTCHours();
    const otEndM = cfg.otEnd.getUTCMinutes();
    const earlyH = cfg.earlyStart.getUTCHours();
    const earlyM = cfg.earlyStart.getUTCMinutes();

    const workStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      workStartH,
      workStartM,
      0,
    );
    const workEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      workEndH,
      workEndM,
      0,
    );
    const otEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      otEndH,
      otEndM,
      0,
    );
    const earlyStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      earlyH,
      earlyM,
      0,
    );

    const totalWorkSeconds = (workEnd.getTime() - workStart.getTime()) / 1000;

    const punches = await this.prisma.punch.findMany({
      where: {
        employeeId,
        eventTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { eventTime: 'asc' },
    });

    let status: AttendanceStatus;
    let firstIn: string | null = null;
    let lastOut: string | null = null;
    let startTime: string | null = null;
    let workedSeconds = 0;
    let overtimeSeconds = 0;
    let notWorkingSeconds = 0;
    let hadManualFlag = false;

    if (!punches.length) {
      status = AttendanceStatus.ABSENT;
      workedSeconds = 0;
      overtimeSeconds = 0;
      notWorkingSeconds = totalWorkSeconds;
      hadManualFlag = false;
    } else {
      const rawEvents: [Date, Direction, Source][] = punches.map((p) => [
        p.eventTime,
        p.direction,
        p.source,
      ]);
      const hasManualPunch = rawEvents.some(([, , s]) => s === Source.manual);
      const [normEvents, adjusted1] = this.normalizeSequence(rawEvents);
      const [periods, adjusted2] = this.buildPeriods(normEvents, d, otEnd);
      hadManualFlag = hasManualPunch || adjusted1 || adjusted2;

      if (persistNormalization && hadManualFlag) {
        await this.persistNormalizedDirections(employeeId, punches, normEvents);
      }

      if (!periods.length) {
        status = AttendanceStatus.ABSENT;
        workedSeconds = 0;
        overtimeSeconds = 0;
        notWorkingSeconds = totalWorkSeconds;
      } else {
        const firstInDt =
          normEvents.find(
            ([t, dd]) => dd === Direction.IN && t >= earlyStart,
          )?.[0] || null;
        const lastOutDt =
          [...normEvents]
            .reverse()
            .find(([, dd]) => dd === Direction.OUT)?.[0] || null;
        // ✅ Fix: Add hour12: true for AM/PM formatting to match desired output
        firstIn = firstInDt
          ? firstInDt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null;
        lastOut = lastOutDt
          ? lastOutDt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null;
        // ✅ Fix: Make startTime dynamic based on workStart (add locale for AM/PM if needed)
        const workStartStr = workStart.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        startTime =
          firstInDt && firstInDt <= workStart ? workStartStr : firstIn;

        let ws = 0,
          os = 0;
        for (const [a, b] of periods) {
          const aC = this.clip(a, workStart, otEnd);
          const bC = this.clip(b, workStart, otEnd);
          if (bC.getTime() <= aC.getTime()) continue;
          ws += this.overlap(aC, bC, workStart, workEnd);
          os += this.overlap(aC, bC, workEnd, otEnd);
        }
        workedSeconds = Math.round(ws);
        overtimeSeconds = Math.round(os);

        const envStartTime = Math.max(
          Math.min(...periods.map((p) => p[0].getTime())),
          workStart.getTime(),
        );
        const envEndTime = Math.min(
          Math.max(...periods.map((p) => p[1].getTime())),
          otEnd.getTime(),
        );
        const envelope =
          envEndTime > envStartTime ? (envEndTime - envStartTime) / 1000 : 0;
        notWorkingSeconds = Math.max(
          0,
          Math.round(envelope - (workedSeconds + overtimeSeconds)),
        );

        let baseStatus: AttendanceStatus;
        if (workedSeconds <= 0) baseStatus = AttendanceStatus.ABSENT;
        else if (workedSeconds < totalWorkSeconds)
          baseStatus = AttendanceStatus.PARTIAL;
        else baseStatus = AttendanceStatus.OK;
        status = hadManualFlag ? AttendanceStatus.MANUAL : baseStatus;
      }
    }

    return this.prisma.attendanceDay.upsert({
      where: { employeeId_workDate: { employeeId, workDate: d } },
      create: {
        employeeId,
        workDate: d,
        startTime,
        firstIn,
        lastOut,
        workedSeconds,
        notWorkingSeconds,
        overtimeSeconds,
        hadManual: hadManualFlag,
        status,
      },
      update: {
        startTime,
        firstIn,
        lastOut,
        workedSeconds,
        notWorkingSeconds,
        overtimeSeconds,
        hadManual: hadManualFlag,
        status,
        calculatedAt: new Date(),
      },
    });
  }

  private normalizeSequence(
    events: [Date, Direction, Source][],
  ): [[Date, Direction, Source][], boolean] {
    let expected: Direction = Direction.IN;
    let adjusted = false;
    const norm: [Date, Direction, Source][] = [];
    for (const [t, d, s] of events) {
      const nd = d === expected ? d : expected;
      adjusted = adjusted || nd !== d;
      norm.push([t, nd, s]);
      expected = nd === Direction.IN ? Direction.OUT : Direction.IN;
    }
    return [norm, adjusted];
  }

  private buildPeriods(
    normEvents: [Date, Direction, Source][],
    d: Date,
    otEnd: Date, // ✅ Fix: Pass otEnd to avoid TS error and use dynamic endCap
  ): [[Date, Date][], boolean] {
    const periods: [Date, Date][] = [];
    let currentIn: Date | null = null;
    let adjusted = false;
    for (const [t, ddir, _] of normEvents) {
      if (ddir === Direction.IN) {
        currentIn = t;
      } else {
        if (currentIn && t > currentIn) {
          periods.push([currentIn, t]);
        }
        currentIn = null;
      }
    }
    if (currentIn) {
      // ✅ Fix: Use passed otEnd for endCap instead of hardcoded 20:00
      const endCap = otEnd;
      if (endCap > currentIn) {
        periods.push([currentIn, endCap]);
      }
      adjusted = true;
    }
    return [periods, adjusted];
  }

  private async persistNormalizedDirections(
    employeeId: string,
    rawPunches: any[],
    normEvents: [Date, Direction, Source][],
    correctedBy = 'auto-normalize',
  ) {
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < rawPunches.length; i++) {
        const punch = rawPunches[i];
        const [t, normDir] = normEvents[i];
        const origDir = punch.direction;
        const src = punch.source;
        if (normDir === origDir) continue;

        const conflict = await tx.punch.findFirst({
          where: {
            employeeId,
            eventTime: t,
            direction: normDir,
            source: src,
          },
        });
        if (conflict) {
          await tx.punch.update({
            where: { id: punch.id },
            data: {
              directionCorrected: true,
              correctionNote:
                (punch.correctionNote || '') +
                ' | skip flip: collision with existing row',
              correctedAt: new Date(),
              correctedBy: punch.correctedBy || correctedBy,
            },
          });
        } else {
          await tx.punch.update({
            where: { id: punch.id },
            data: {
              originalDirection: punch.directionCorrected
                ? punch.originalDirection
                : punch.direction,
              direction: normDir,
              directionCorrected: true,
              correctedBy,
              correctionNote:
                (punch.correctionNote || '') + ' | normalized sequence',
              correctedAt: new Date(),
            },
          });
        }
      }
    });
  }

  private overlap(a1: Date, a2: Date, b1: Date, b2: Date): number {
    const start = Math.max(a1.getTime(), b1.getTime());
    const end = Math.min(a2.getTime(), b2.getTime());
    return Math.max(0, (end - start) / 1000);
  }

  private clip(dt: Date, lo: Date, hi: Date): Date {
    return new Date(
      Math.max(lo.getTime(), Math.min(hi.getTime(), dt.getTime())),
    );
  }

  private ymd(d: Date): string {
    // ✅ Improvement: Use UTC methods for consistent date extraction from UTC timestamps
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async recalcUserAllDays(employeeId: string, persistNormalization = true) {
    if (!employeeId?.trim()) {
      throw new BadRequestException('employeeId is required');
    }
    const uniqueDays = new Set<string>();
    const pageSize = 2000;
    let cursor: { id: number } | undefined = undefined;

    for (;;) {
      const punches = await this.prisma.punch.findMany({
        where: { employeeId },
        select: { id: true, eventTime: true },
        orderBy: { id: 'asc' }, // stable pagination
        take: pageSize,
        ...(cursor ? { skip: 1, cursor } : {}),
      });

      if (!punches.length) break;

      // for (const p of punches) {
      //   uniqueDays.add(this.ymd(p.eventTime));
      // }
      // ✅ Fix: Remove redundant new Date(); use p.eventTime directly (it's already a Date)
      for (const p of punches) uniqueDays.add(this.ymd(p.eventTime));

      cursor = { id: punches[punches.length - 1].id };
      if (punches.length < pageSize) break;
    }

    // new
    if (uniqueDays.size === 0) return { employeeId, daysProcessed: 0 };

    // Recalculate day-by-day (sequential to keep DB load predictable)
    let processed = 0;
    for (const workDate of Array.from(uniqueDays).sort()) {
      await this.calculateAttendance(
        { employeeId, workDate },
        persistNormalization,
      );
      processed++;
    }

    return { employeeId, daysProcessed: processed };
  }

  async recalcAllUsersAllDays(persistNormalization = true) {
    const users = await this.prisma.user.findMany({
      select: { employeeId: true },
      where: {
        active: true,
        employeeId: { not: null },
      },
    });

    const results: Array<{ employeeId: string; daysProcessed: number }> = [];
    for (const u of users) {
      const empId = u.employeeId!; // safe due to filter above
      const res = await this.recalcUserAllDays(empId, persistNormalization);
      results.push(res);
    }
    return results;
  }

  private parseMonthRange(month: string): { start: Date; end: Date } {
    // Treat as local time range (00:00 at local to next month 00:00)
    const [y, m] = month.split('-').map((n) => parseInt(n, 10));
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 1, 0, 0, 0, 0); // first day of next month
    return { start, end };
  }

  private parseDayRange(date: string): { start: Date; end: Date } {
    const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    return { start, end };
  }

  private dateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private buildMonthSkeleton(month: string): string[] {
    const { start, end } = this.parseMonthRange(month);
    const days: string[] = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      days.push(this.dateKey(d));
    }
    return days;
  }

  /**
   * 1) Monthly raw records endpoint service
   * Returns:
   * {
   *   month, timezone,
   *   employees: [
   *     { id, name, records: [{ date, start, lastOut, workedSeconds, notWorkingSeconds, overtimeSeconds }, ...all days...] }
   *   ]
   * }
   */
  async getMonthRecords(params: GetMonthRecordsParams) {
    const { month, employeeIds, timezone } = params;
    const { start, end } = this.parseMonthRange(month);

    // Resolve employees (active, with employeeId); optional filter
    const users = await this.prisma.user.findMany({
      where: {
        active: true,
        employeeId: { not: null },
        ...(employeeIds?.length ? { employeeId: { in: employeeIds } } : {}),
      },
      select: { employeeId: true, name: true },
      orderBy: { name: 'asc' },
    });

    const empIds = users.map((u) => u.employeeId!) as string[];
    if (empIds.length === 0) {
      return { month, timezone, employees: [] };
    }

    // Pull all attendance rows in month for these employees
    const rows = await this.prisma.attendanceDay.findMany({
      where: {
        employeeId: { in: empIds },
        workDate: { gte: start, lt: end },
      },
      select: {
        employeeId: true,
        workDate: true,
        startTime: true,
        firstIn: true,
        lastOut: true,
        workedSeconds: true,
        notWorkingSeconds: true,
        overtimeSeconds: true,
      },
      orderBy: [{ employeeId: 'asc' }, { workDate: 'asc' }],
    });

    // Index by empId + date
    const byEmpDate = new Map<
      string,
      {
        startTime: string | null;
        firstIn: string | null;
        lastOut: string | null;
        workedSeconds: number;
        notWorkingSeconds: number;
        overtimeSeconds: number;
      }
    >();
    for (const r of rows) {
      const key = `${r.employeeId}::${this.dateKey(r.workDate)}`;
      byEmpDate.set(key, {
        startTime: r.startTime,
        firstIn: r.firstIn,
        lastOut: r.lastOut,
        workedSeconds: r.workedSeconds ?? 0,
        notWorkingSeconds: r.notWorkingSeconds ?? 0,
        overtimeSeconds: r.overtimeSeconds ?? 0,
      });
    }

    const days = this.buildMonthSkeleton(month);

    const employees = users.map((u) => {
      const records = days.map((dkey) => {
        const k = `${u.employeeId}::${dkey}`;
        const r = byEmpDate.get(k);
        const start = r?.startTime ?? r?.firstIn ?? null;
        const lastOut = r?.lastOut ?? null;
        return {
          date: dkey,
          start,
          lastOut,
          workedSeconds: r?.workedSeconds ?? 0,
          notWorkingSeconds: r?.notWorkingSeconds ?? 0,
          overtimeSeconds: r?.overtimeSeconds ?? 0,
        };
      });
      return { id: u.employeeId!, name: u.name, records };
    });

    return { month, timezone, employees };
  }

  /**
   * 2) Single-day snapshot service
   * Returns:
   * {
   *   date, timezone,
   *   employees: [{ id, name, start, lastOut, workedSeconds, notWorkingSeconds, overtimeSeconds }]
   * }
   */
  async getDaySnapshot(params: GetDaySnapshotParams) {
    const { date, employeeIds, timezone } = params;
    const { start, end } = this.parseDayRange(date);

    // Resolve employees (active, with employeeId); optional filter
    const users = await this.prisma.user.findMany({
      where: {
        active: true,
        employeeId: { not: null },
        ...(employeeIds?.length ? { employeeId: { in: employeeIds } } : {}),
      },
      select: { employeeId: true, name: true },
      orderBy: { name: 'asc' },
    });

    const empIds = users.map((u) => u.employeeId!) as string[];
    if (empIds.length === 0) {
      return { date, timezone, employees: [] };
    }

    // Pull day rows
    const rows = await this.prisma.attendanceDay.findMany({
      where: {
        employeeId: { in: empIds },
        workDate: { gte: start, lt: end },
      },
      select: {
        employeeId: true,
        startTime: true,
        firstIn: true,
        lastOut: true,
        workedSeconds: true,
        notWorkingSeconds: true,
        overtimeSeconds: true,
      },
    });

    const byEmp = new Map<
      string,
      {
        startTime: string | null;
        firstIn: string | null;
        lastOut: string | null;
        workedSeconds: number;
        notWorkingSeconds: number;
        overtimeSeconds: number;
      }
    >();
    for (const r of rows) {
      byEmp.set(r.employeeId, {
        startTime: r.startTime,
        firstIn: r.firstIn,
        lastOut: r.lastOut,
        workedSeconds: r.workedSeconds ?? 0,
        notWorkingSeconds: r.notWorkingSeconds ?? 0,
        overtimeSeconds: r.overtimeSeconds ?? 0,
      });
    }

    const employees = users.map((u) => {
      const r = byEmp.get(u.employeeId!);
      const startVal = r?.startTime ?? r?.firstIn ?? null;
      return {
        id: u.employeeId!,
        name: u.name,
        start: startVal,
        lastOut: r?.lastOut ?? null,
        workedSeconds: r?.workedSeconds ?? 0,
        notWorkingSeconds: r?.notWorkingSeconds ?? 0,
        overtimeSeconds: r?.overtimeSeconds ?? 0,
      };
    });

    return { date, timezone, employees };
  }
}
