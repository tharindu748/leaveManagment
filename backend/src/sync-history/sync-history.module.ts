import { Module } from '@nestjs/common';
import { SyncHistoryService } from './sync-history.service';
import { SyncHistoryController } from './sync-history.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [SyncHistoryService, DatabaseService],
  controllers: [SyncHistoryController],
  exports: [SyncHistoryService],
})
export class SyncHistoryModule {}
