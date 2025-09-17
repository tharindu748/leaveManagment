import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { SyncHistoryModule } from 'src/sync-history/sync-history.module';
import { PunchesModule } from 'src/punches/punches.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { DeviceConfigService } from './device-config.service';

@Module({
  imports: [
    UsersModule,
    SyncHistoryModule,
    PunchesModule,
    AttendanceModule,
    DatabaseModule,
  ],
  providers: [DeviceService, DeviceConfigService],
  controllers: [DeviceController],
})
export class DeviceModule {}
