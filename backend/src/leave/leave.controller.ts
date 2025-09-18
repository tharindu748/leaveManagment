import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create_leave_request.dto';
import { LeaveType } from '@prisma/client';
import { ApproveLeaveRequestDto } from './dto/approve_leave_request.dto';
import { CancelLeaveRequestDto } from './dto/cancel_leave_request.dto';
import { UpdateLeavePolicyDto } from './dto/update_leave_policy.dto';

@Controller('leave')
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post('request')
  async createLeaveRequest(@Body() data: CreateLeaveRequestDto) {
    return this.leaveService.createLeaveRequest(data);
  }

  @Get('requests')
  async getLeaveRequests(@Query('userId') userId?: string) {
    let parsedId: number | undefined;

    if (userId !== undefined) {
      if (userId === '')
        throw new BadRequestException('userId cannot be empty');
      const n = Number(userId);
      if (!Number.isInteger(n)) {
        throw new BadRequestException('userId must be an integer');
      }
      parsedId = n;
    }

    return this.leaveService.findLeaveRequests(parsedId);
  }

  @Get('balance/:userId/:year/:leaveType')
  async getLeaveBalance(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('leaveType') leaveType: LeaveType,
  ) {
    return this.leaveService.getLeaveBalance(userId, year, leaveType);
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  async approveLeaveRequest(@Body() data: ApproveLeaveRequestDto) {
    return this.leaveService.approveLeaveRequest(data);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelLeaveRequest(@Body() data: CancelLeaveRequestDto) {
    return this.leaveService.cancelLeaveRequest(data);
  }

  @Patch('policy')
  async updateLeavePolicy(@Body() data: UpdateLeavePolicyDto) {
    return this.leaveService.updateLeavePolicy(
      data.leaveType,
      data.defaultBalance,
    );
  }
}
