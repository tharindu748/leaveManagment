import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SyncHistoryService } from './sync-history.service';
import { CreateSyncHistoryDto } from './dto/sync-history.dto';

@Controller('sync-history')
export class SyncHistoryController {
  constructor(private readonly syncHistoryService: SyncHistoryService) {}

  @Post()
  create(@Body() dto: CreateSyncHistoryDto) {
    return this.syncHistoryService.addRecord(dto);
  }

  @Get()
  findRecent(@Query('limit') limit: string) {
    return this.syncHistoryService.listRecent(parseInt(limit) || 50);
  }
}
