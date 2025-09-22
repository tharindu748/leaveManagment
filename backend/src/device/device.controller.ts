// src/device/device.controller.ts
import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceCredentialsDto } from './dto/device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('credentials')
  async setCredentials(@Body() creds: DeviceCredentialsDto) {
    return this.deviceService.setCredentials(creds);
  }

  @Post('sync-users')
  async syncUsers() {
    return this.deviceService.syncUsers();
  }

  @Post('start-polling')
  async startPolling() {
    return this.deviceService.startPolling();
  }

  @Post('stop-polling')
  async stopPolling() {
    return this.deviceService.stopPolling();
  }

  // New endpoints for auth management
  @Get('auth-status')
  async getAuthStatus() {
    return this.deviceService.getAuthStatus();
  }

  @Delete('auth-failures')
  async clearAuthFailures() {
    return this.deviceService.clearAuthFailures();
  }
}
