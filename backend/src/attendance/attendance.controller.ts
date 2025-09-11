import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CalculateAttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateAttendanceDto) {
    return this.attendanceService.calculateAttendance(dto);
  }

  @Get(':employeeId/:workDate')
  get(
    @Param('employeeId') employeeId: string,
    @Param('workDate') workDate: string,
  ) {
    return this.attendanceService.getAttendanceDay(employeeId, workDate);
  }
}
