import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create_leave_request.dto';

@Controller('leave')
export class LeaveController {
    constructor(private leaveService: LeaveService) {}

    @Get()
    async getLeaveRequests(@Query('userId') userId: number) {
        return this.leaveService.findLeaveRequestsByUserId(userId);
    }

    @Post()
    async createLeaveRequest(@Body() data: CreateLeaveRequestDto) {
        return this.leaveService.createLeaveRequest(data);
    }
}
