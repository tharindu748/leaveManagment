import { Controller, Get, Post, Body, Query } from '@nestjs/common';
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
  latest(@Query('limit') limit: string) {
    return this.punchesService.getLatestPunches(parseInt(limit) || 50);
  }
}
