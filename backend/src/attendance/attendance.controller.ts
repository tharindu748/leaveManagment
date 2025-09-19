import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CalculateAttendanceDto } from './dto/attendance.dto';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateAttendanceDto) {
    return this.attendanceService.calculateAttendance(dto);
  }

  @Get('recalc-all-days/:employeeId')
  findAllAttendanceUser(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findAllAttendanceUser(employeeId);
  }

  @Get(':employeeId/:workDate')
  get(
    @Param('employeeId') employeeId: string,
    @Param('workDate') workDate: string,
  ) {
    return this.attendanceService.findAttendanceDay(employeeId, workDate);
  }

  @Post('recalc-all-days/:employeeId')
  recalcUserAllDays(
    @Param('employeeId') employeeId: string,
    @Query('persistNormalization') persist = 'true',
  ) {
    return this.attendanceService.recalcUserAllDays(
      employeeId,
      persist !== 'false',
    );
  }

  @Post('recalc-all-users')
  recalcAllUsersAllDays(@Query('persistNormalization') persist = 'true') {
    return this.attendanceService.recalcAllUsersAllDays(persist !== 'false');
  }

  @Get('config')
  async getConfig() {
    return this.attendanceService.getAttendanceConfig();
  }

  @Patch('config')
  async updateConfig(@Body() dto: UpdateAttendanceConfigDto) {
    return this.attendanceService.updateAttendanceConfig(dto);
  }

  /**
   * 1) Monthly raw records (powers Day + Month UI)
   * GET /attendance/records?month=YYYY-MM&employees=emp-1,emp-2&tz=Asia/Colombo
   */
  @Get('records')
  async getMonthlyRecords(
    @Query('month') month: string,
    @Query('employees') employees?: string,
    @Query('tz') tz?: string,
  ) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('month must be YYYY-MM');
    }
    const empList = employees
      ? employees
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    return this.attendanceService.getMonthRecords({
      month,
      employeeIds: empList,
      timezone: tz || 'Asia/Colombo',
    });
  }

  /**
   * 2) Day snapshot
   * GET /attendance/day?date=YYYY-MM-DD&employees=emp-1,emp-2&tz=Asia/Colombo
   */
  @Get('day')
  async getDaySnapshot(
    @Query('date') date: string,
    @Query('employees') employees?: string,
    @Query('tz') tz?: string,
  ) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }
    const empList = employees
      ? employees
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    return this.attendanceService.getDaySnapshot({
      date,
      employeeIds: empList,
      timezone: tz || 'Asia/Colombo',
    });
  }
}
