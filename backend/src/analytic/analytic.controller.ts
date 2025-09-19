import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticService } from './analytic.service';

function toISODateOnly(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class OptionalDateParamPipe {
  transform(value?: string) {
    if (!value) return undefined;
    // Accept only YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('date must be in YYYY-MM-DD format');
    }
    return value;
  }
}

@Controller('reports')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

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

  @Get('most-late-employees')
  async getMostLateEmployees(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticService.getMostLateEmployees({
      start,
      end,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('least-late-employees')
  async getLeastLateEmployees(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticService.getLeastLateEmployees({
      start,
      end,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('summary')
  async getSummary(@Query('date', new OptionalDateParamPipe()) date?: string) {
    const dateStr = date ?? toISODateOnly(new Date());
    return this.analyticService.getDailySummary(dateStr);
  }
}
