import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  BadRequestException,
  ParseIntPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { PunchesService } from './punches.service';
import { CreatePunchDto } from './dto/punches.dto';

@Controller('punches')
export class PunchesController {
  constructor(private readonly punchesService: PunchesService) {}

  @Post()
  create(@Body() dto: CreatePunchDto) {
    return this.punchesService.insertPunch(dto);
  }

  @Get('latest')
  latest(
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const n = limit !== undefined ? parseInt(limit, 10) : undefined;

    if (limit !== undefined && Number.isNaN(n)) {
      throw new BadRequestException("Invalid number for 'limit'");
    }

    return this.punchesService.getLatestPunches(n, employeeId);
  }

  @Get()
  async getPunches(
    @Query('employeeId') employeeId?: string,
    @Query('name') name?: string,
    @Query('date') date?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    let eventTime: Date | { from: Date; to: Date } | undefined;

    if (date) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new BadRequestException("Invalid date format for 'date'");
      }
      eventTime = d;
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new BadRequestException("Invalid date format for 'from'/'to'");
      }
      eventTime = { from: fromDate, to: toDate };
    }

    return this.punchesService.getPunches({ employeeId, name, eventTime });
  }

  @Put(':id')
  async deletePunch(@Param('id', ParseIntPipe) id: number) {
    return this.punchesService.deletePunch(id);
  }
}
