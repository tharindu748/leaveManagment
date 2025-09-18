import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateLeaveRequestDto } from './dto/create_leave_request.dto';
import { LeaveStatus, LeaveType } from '@prisma/client';
import { ApproveLeaveRequestDto } from './dto/approve_leave_request.dto';
import { CancelLeaveRequestDto } from './dto/cancel_leave_request.dto';

@Injectable()
export class LeaveService {
  constructor(private databaseService: DatabaseService) {}

  private async getOrInitializeBalance(
    userId: number,
    year: number,
    leaveType: LeaveType,
  ) {
    let balance = await this.databaseService.leave_balance.findUnique({
      where: {
        userId_year_leaveType: { userId, year, leaveType },
      },
    });

    if (!balance) {
      const policy = await this.databaseService.leave_policy.findUnique({
        where: { leaveType },
      });
      if (!policy) {
        throw new NotFoundException(
          `No policy found for leave type: ${leaveType}`,
        );
      }
      balance = await this.databaseService.leave_balance.create({
        data: {
          userId,
          year,
          leaveType,
          balance: policy.defaultBalance,
        },
      });
    }
    return balance;
  }

  async createLeaveRequest(data: CreateLeaveRequestDto) {
    const { userId, leaveType, reason, dates } = data;

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

    const datesForCheck = dates.map((d) => ({
      date: normalizeDate(new Date(d.date)).toISOString(),
      isHalfDay: !!d.isHalfDay,
    }));

    await this.checkSufficientBalance(userId, leaveType, datesForCheck);

    return this.databaseService.leave_request.create({
      data: {
        user: { connect: { id: userId } },
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

  // Helper to calculate deductions grouped by year
  private calculateDeductionsByYear(
    dates: { leaveDate: Date; isHalfDay: boolean }[],
  ) {
    const deductionsByYear = new Map<number, number>();
    dates.forEach((d) => {
      const year = d.leaveDate.getUTCFullYear();
      const deduction = d.isHalfDay ? 0.5 : 1;
      deductionsByYear.set(year, (deductionsByYear.get(year) || 0) + deduction);
    });
    return deductionsByYear;
  }

  // Helper to check if sufficient balance across years
  private async checkSufficientBalance(
    userId: number,
    leaveType: LeaveType,
    dates: { date: string; isHalfDay?: boolean; halfDayType?: string }[],
  ) {
    const normalizedDates = dates.map((d) => ({
      leaveDate: new Date(d.date),
      isHalfDay: d.isHalfDay ?? false,
    }));
    const deductionsByYear = this.calculateDeductionsByYear(normalizedDates);

    for (const [year, deduction] of deductionsByYear.entries()) {
      const balance = await this.getOrInitializeBalance(
        userId,
        year,
        leaveType,
      );
      if (balance.balance < deduction) {
        throw new BadRequestException(
          `Insufficient ${leaveType} leave balance for year ${year}. Available: ${balance.balance}, Required: ${deduction}`,
        );
      }
    }
  }

  // Approve a leave request and deduct balances
  async approveLeaveRequest(dto: ApproveLeaveRequestDto) {
    const request = await this.databaseService.leave_request.findUnique({
      where: { id: dto.requestId },
      include: { dates: true },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    // Check sufficient balance
    const datesForCheck = request.dates.map((d) => ({
      date: d.leaveDate.toISOString(),
      isHalfDay: d.isHalfDay,
    }));
    await this.checkSufficientBalance(
      request.userId,
      request.leaveType,
      datesForCheck,
    );

    // Deduct from balances
    const deductionsByYear = this.calculateDeductionsByYear(request.dates);
    for (const [year, deduction] of deductionsByYear.entries()) {
      await this.databaseService.leave_balance.update({
        where: {
          userId_year_leaveType: {
            userId: request.userId,
            year,
            leaveType: request.leaveType,
          },
        },
        data: { balance: { decrement: deduction } },
      });
    }

    // Update request status
    return this.databaseService.leave_request.update({
      where: { id: dto.requestId },
      data: {
        status: LeaveStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: dto.approvedBy,
      },
      include: { dates: true, user: true },
    });
  }

  // Cancel a leave request (add back if approved)
  async cancelLeaveRequest(dto: CancelLeaveRequestDto) {
    const request = await this.databaseService.leave_request.findUnique({
      where: { id: dto.requestId },
      include: { dates: true },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    if (request.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Request already cancelled');
    }

    if (request.status === LeaveStatus.APPROVED) {
      // Add back to balances
      const deductionsByYear = this.calculateDeductionsByYear(request.dates);
      for (const [year, deduction] of deductionsByYear.entries()) {
        await this.databaseService.leave_balance.update({
          where: {
            userId_year_leaveType: {
              userId: request.userId,
              year,
              leaveType: request.leaveType,
            },
          },
          data: { balance: { increment: deduction } },
        });
      }
    }

    // Update status
    return this.databaseService.leave_request.update({
      where: { id: dto.requestId },
      data: { status: LeaveStatus.CANCELLED, approvedBy: dto.approvedBy },
      include: { dates: true, user: true },
    });
  }

  // Admin method to update company policy (affects all employees for current year)
  async updateLeavePolicy(leaveType: LeaveType, newDefaultBalance: number) {
    const policy = await this.databaseService.leave_policy.upsert({
      where: { leaveType },
      update: { defaultBalance: newDefaultBalance },
      create: { leaveType, defaultBalance: newDefaultBalance },
    });

    const oldDefault = policy.defaultBalance; // This is the old value before update? Wait, no—upsert returns updated.
    // To get delta, fetch old first
    // Actually, restructure: fetch old, compute delta, then update

    const existingPolicy = await this.databaseService.leave_policy.findUnique({
      where: { leaveType },
    });
    const oldDefaultBalance = existingPolicy
      ? existingPolicy.defaultBalance
      : 0; // Assume 0 if new
    const delta = newDefaultBalance - oldDefaultBalance;

    // Update policy
    await this.databaseService.leave_policy.upsert({
      where: { leaveType },
      update: { defaultBalance: newDefaultBalance },
      create: { leaveType, defaultBalance: newDefaultBalance },
    });

    // Apply delta to all existing balances for current year
    const currentYear = new Date().getUTCFullYear();
    await this.databaseService.leave_balance.updateMany({
      where: { leaveType, year: currentYear },
      data: { balance: { increment: delta } },
    });

    return {
      message: `Policy updated for ${leaveType}. Delta ${delta} applied to all current-year balances.`,
    };
  }

  async findLeaveRequests(userId?: number) {
    const where = userId != null ? { userId } : {};

    return this.databaseService.leave_request.findMany({
      where,
      include: {
        dates: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // New: Get balance for a user (initializes if needed)
  async getLeaveBalance(userId: number, year: number, leaveType: LeaveType) {
    return this.getOrInitializeBalance(userId, year, leaveType);
  }
}
