import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Direction, Prisma, Source } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreatePunchDto } from './dto/punches.dto';

type EventTime = Date | { from: Date; to: Date };

interface GetPunchesParams {
  employeeId?: string;
  name?: string; // search by user's name (contains, case-insensitive)
  eventTime?: EventTime;
}

@Injectable()
export class PunchesService {
  constructor(private prisma: DatabaseService) {}

  async getLatestPunches(limit?: number, employeeId?: string) {
    return this.prisma.punch.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        deletedAt: null,
      },
      orderBy: [{ correctEventTime: 'desc' }, { eventTime: 'desc' }],
      ...(typeof limit === 'number' ? { take: limit } : {}),
      include: {
        user: { select: { name: true } },
      },
    });
  }

  async insertPunch(dto: CreatePunchDto) {
    const eventTime = new Date(dto.eventTime); // Parses full ISO with offset if provided
    let direction = dto.direction as Direction | undefined;

    if (dto.source === 'manual') {
      if (!direction || !['IN', 'OUT'].includes(direction)) {
        throw new BadRequestException(
          "Manual punches require a valid 'direction' (IN/OUT).",
        );
      }
    }

    if (
      dto.source === 'device' &&
      (!direction || !['IN', 'OUT'].includes(direction))
    ) {
      direction = await this.autoDirectionForDevice(dto.employeeId, eventTime);
    }

    try {
      const punch = await this.prisma.punch.create({
        data: {
          employeeId: dto.employeeId,
          eventTime,
          correctEventTime: eventTime, // mirror like Python does
          direction: direction as Direction,
          source: dto.source as Source,
          note: dto.note,
          createdBy: dto.createdBy,
        },
      });
      return punch;
    } catch (e: any) {
      if (e.code === 'P2002') {
        return null;
      }
      throw e;
    }
  }

  private async autoDirectionForDevice(
    employeeId: string,
    eventTime: Date,
  ): Promise<Direction> {
    // Use the *corrected* timeline (mirrors Python’s _auto_direction_for_device).
    // To handle day start consistently in UTC (avoid local TZ issues)
    const utcYear = eventTime.getUTCFullYear();
    const utcMonth = eventTime.getUTCMonth();
    const utcDate = eventTime.getUTCDate();
    const dayStart = new Date(Date.UTC(utcYear, utcMonth, utcDate));

    const last = await this.prisma.punch.findFirst({
      where: {
        employeeId,
        correctEventTime: { gte: dayStart, lt: eventTime },
      },
      orderBy: { correctEventTime: 'desc' },
      select: { direction: true },
    });
    if (!last) return Direction.IN;
    return last.direction === Direction.IN ? Direction.OUT : Direction.IN;
  }

  private buildDateFilter(eventTime?: EventTime) {
    if (!eventTime) return undefined;
    if (eventTime instanceof Date) {
      // Use UTC day boundaries for consistency
      const utcYear = eventTime.getUTCFullYear();
      const utcMonth = eventTime.getUTCMonth();
      const utcDate = eventTime.getUTCDate();
      const start = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
      const end = new Date(
        Date.UTC(utcYear, utcMonth, utcDate, 23, 59, 59, 999),
      );
      return { gte: start, lte: end };
    }
    if (eventTime.from && eventTime.to) {
      return { gte: new Date(eventTime.from), lte: new Date(eventTime.to) };
    }
    return undefined;
  }

  async getPunches({ employeeId, name, eventTime }: GetPunchesParams) {
    try {
      const dateFilter = this.buildDateFilter(eventTime);
      const where: Prisma.PunchWhereInput = {
        ...(employeeId && { employeeId }),
        ...(name && {
          user: {
            name: { contains: name, mode: 'insensitive' },
          },
        }),
        deletedAt: null,
        ...(dateFilter && { correctEventTime: dateFilter }),
      };
      return await this.prisma.punch.findMany({
        where,
        orderBy: [
          { correctEventTime: 'desc' },
          { eventTime: 'desc' }, // fallback sort
        ],
        include: {
          user: { select: { name: true } },
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch punches');
    }
  }

  async deletePunch(id: number) {
    try {
      const punche = await this.prisma.punch.update({
        data: { deletedAt: new Date() },
        where: { id },
      });
      return punche;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Punch not found');
    }
  }
}
