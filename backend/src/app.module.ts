import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { LeaveModule } from './leave/leave.module';
import { EmployeesModule } from './employees/employees.module';
import { PunchesModule } from './punches/punches.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RegusersModule } from './regusers/regusers.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [UsersModule, DatabaseModule, AuthModule, LeaveModule, EmployeesModule, PunchesModule, AttendanceModule, RegusersModule, SyncHistoryModule, DeviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
