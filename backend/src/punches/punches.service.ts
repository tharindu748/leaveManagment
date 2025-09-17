// src/punches/punches.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Direction, Source } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreatePunchDto } from './dto/punches.dto';

@Injectable()
export class PunchesService {
  constructor(private prisma: DatabaseService) {}

  async getLatestPunches(limit = 50) {
    return this.prisma.punch.findMany({
      orderBy: { correctEventTime: 'desc' }, // use corrected timeline
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async insertPunch(dto: CreatePunchDto) {
    const eventTime = new Date(dto.eventTime);
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
        // duplicate (unique: employeeId, eventTime, direction, source). Ignore, like INSERT IGNORE.
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
    const dayStart = new Date(
      eventTime.getFullYear(),
      eventTime.getMonth(),
      eventTime.getDate(),
    );
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
}
