import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticService } from './analytic.service';

@Controller('reports')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  /**
   * Returns per-user summary:
   * [{ id, name, late, workingDays }]
   *
   * Query params (optional):
   * - start: ISO date (YYYY-MM-DD)
   * - end:   ISO date (YYYY-MM-DD)
   * - employeeId: filter to a single employeeId (users.employee_id)
   */
  @Get('attendance-summary')
  async getAttendanceSummary(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.analyticService.getEmployeeWorkSummary({
      start,
      end,
      employeeId,
    });
  }
}
