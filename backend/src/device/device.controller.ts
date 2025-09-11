import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceCredentialsDto } from './dto/device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('credentials')
  setCredentials(@Body() dto: DeviceCredentialsDto) {
    this.deviceService.setCredentials(dto);
    return { status: 'ok' };
  }

  @Post('sync-users')
  syncUsers() {
    return this.deviceService.syncUsers();
  }

  @Post('start-polling')
  startPolling() {
    return this.deviceService.startPolling();
  }

  @Post('stop-polling')
  stopPolling() {
    return this.deviceService.stopPolling();
  }
}
