import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateLeaveRequestDto } from './dto/create_leave_request.dto';

@Injectable()
export class LeaveService {
  constructor(private databaseService: DatabaseService) {}

  async createLeaveRequest(data: CreateLeaveRequestDto) {
    const { userId, approvedBy, leaveType, reason, dates } = data;

    return this.databaseService.leave_request.create({
      data: {
        user: { connect: { id: userId } },
        approvedBy,
        leaveType,
        reason,
        dates: {
          create: dates.map((d) => ({
            leaveDate: new Date(d.date),
            isHalfDay: d.isHalfDay ?? false,
            halfdayType: d.halfDayType ?? undefined,
          })),
        },
      },
      include: {
        dates: true,
        user: true,
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
