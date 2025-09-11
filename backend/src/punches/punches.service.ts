import { BadRequestException, Injectable } from '@nestjs/common';
import { Direction, Source } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreatePunchDto } from './dto/punches.dto';

@Injectable()
export class PunchesService {
  constructor(private prisma: DatabaseService) {}

  async getLatestPunches(limit: number = 50) {
    return this.prisma.punch.findMany({
      orderBy: { eventTime: 'desc' },
      take: limit,
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
          direction: direction as Direction,
          source: dto.source as Source,
          note: dto.note,
          createdBy: dto.createdBy,
        },
      });
      return punch;
    } catch (e) {
      if (e.code === 'P2002') {
        return null; // duplicate ignored
      }
      throw e;
    }
  }

  private async autoDirectionForDevice(
    employeeId: string,
    eventTime: Date,
  ): Promise<Direction> {
    const dayStart = new Date(
      eventTime.getFullYear(),
      eventTime.getMonth(),
      eventTime.getDate(),
    );
    const lastPunch = await this.prisma.punch.findFirst({
      where: {
        employeeId,
        eventTime: {
          gte: dayStart,
          lt: eventTime,
        },
      },
      orderBy: { eventTime: 'desc' },
      select: { direction: true },
    });
    if (!lastPunch) return Direction.IN;
    return lastPunch.direction === Direction.IN ? Direction.OUT : Direction.IN;
  }
}
