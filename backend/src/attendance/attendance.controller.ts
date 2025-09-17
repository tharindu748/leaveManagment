import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
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
}
