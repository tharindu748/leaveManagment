import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [AnalyticService, DatabaseService],
  controllers: [AnalyticController],
})
export class AnalyticModule {}
