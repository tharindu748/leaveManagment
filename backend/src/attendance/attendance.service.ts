import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceStatus, Direction, Source } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CalculateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: DatabaseService) {}

  async getAttendanceDay(employeeId: string, workDate: string) {
    try {
      const wd = new Date(workDate);
      return this.prisma.attendanceDay.findUnique({
        where: { employeeId_workDate: { employeeId, workDate: wd } },
      });
    } catch (e) {
      throw new BadRequestException('Invalid date');
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
    const workStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      8,
      0,
      0,
    );
    const workEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      16,
      30,
      0,
    );
    const otEnd = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      20,
      0,
      0,
    );
    const earlyStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      7,
      0,
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
      const [periods, adjusted2] = this.buildPeriods(normEvents, d);
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
        firstIn = firstInDt
          ? firstInDt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;
        lastOut = lastOutDt
          ? lastOutDt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;
        startTime = firstInDt && firstInDt <= workStart ? '08:00' : firstIn;

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
      const endCap = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        20,
        0,
        0,
      );
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
}
