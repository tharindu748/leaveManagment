import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegusersController } from './regusers.controller';
import { RegusersService } from './regusers.service';

@Module({
  controllers: [RegusersController],
  providers: [RegusersService, DatabaseService],
  exports: [RegusersService],
})
export class RegusersModule {}
