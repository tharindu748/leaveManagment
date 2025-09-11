import { Module } from '@nestjs/common';
import { PunchesService } from './punches.service';
import { PunchesController } from './punches.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [PunchesService, DatabaseService],
  controllers: [PunchesController],
  exports: [PunchesService],
})
export class PunchesModule {}
