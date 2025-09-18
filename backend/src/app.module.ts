import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { LeaveModule } from './leave/leave.module';
import { PunchesModule } from './punches/punches.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { DeviceModule } from './device/device.module';
import { AnalyticModule } from './analytic/analytic.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    AuthModule,
    LeaveModule,
    PunchesModule,
    AttendanceModule,
    SyncHistoryModule,
    DeviceModule,
    AnalyticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
