import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateLeaveRequestDto } from './dto/create_leave_request.dto';
import { LeaveStatus } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(private databaseService: DatabaseService) {}

  async createLeaveRequest(data: CreateLeaveRequestDto) {
    const { userId, approvedBy, leaveType, reason, dates } = data;

    // Helper function to normalize dates to the start of the day (midnight) for accurate comparison.
    const normalizeDate = (date: Date): Date => {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    };

    const requestedDates = dates.map((d) => normalizeDate(new Date(d.date)));

    const existingDates =
      await this.databaseService.leave_request_date.findMany({
        where: {
          request: {
            userId: userId,
            status: {
              in: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
            },
          },
          leaveDate: {
            in: requestedDates,
          },
        },
      });

    if (existingDates.length > 0) {
      const conflictingDates = existingDates
        .map((d) => d.leaveDate.toISOString().split('T')[0])
        .join(', ');

      throw new ConflictException(
        `Leave request already exists for this user on the following dates : ${conflictingDates}`,
      );
    }

    return this.databaseService.leave_request.create({
      data: {
        user: { connect: { id: userId } },
        approvedBy,
        leaveType,
        reason,
        dates: {
          create: dates.map((d) => ({
            leaveDate: normalizeDate(new Date(d.date)),
            isHalfDay: d.isHalfDay ?? false,
            halfdayType: d.isHalfDay ? d.halfDayType : null,
          })),
        },
      },
      include: {
        dates: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  findLeaveRequestsByUserId(userId: number) {
    return this.databaseService.leave_request.findMany({
      where: { userId },
      include: {
        dates: true,
        user: true,
      },
    });
  }
}
