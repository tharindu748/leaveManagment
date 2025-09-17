// src/device/device-config.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import DigestFetch from 'digest-fetch';
import * as crypto from 'crypto';

export interface DeviceCreds {
  ip: string;
  username: string;
  password: string;
}

@Injectable()
export class DeviceConfigService {
  constructor(private prisma: DatabaseService) {}

  private encKey() {
    const key = process.env.DEVICE_CRED_KEY;
    if (!key || key.length < 32) {
      throw new BadRequestException('DEVICE_CRED_KEY must be set (>=32 chars)');
    }
    return crypto.createHash('sha256').update(key).digest();
  }

  private encrypt(plain: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encKey(), iv);
    const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}.${ct.toString('base64')}.${tag.toString('base64')}`;
  }

  private decrypt(enc: string): string {
    const [ivB64, ctB64, tagB64] = enc.split('.');
    const iv = Buffer.from(ivB64, 'base64');
    const ct = Buffer.from(ctB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encKey(), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString('utf8');
  }

  async save(creds: DeviceCreds) {
    const passwordEnc = this.encrypt(creds.password);
    await this.prisma.deviceConfig.upsert({
      where: { id: 1 },
      update: { ip: creds.ip, username: creds.username, passwordEnc },
      create: { id: 1, ip: creds.ip, username: creds.username, passwordEnc },
    });
  }

  async getOrThrow(): Promise<DeviceCreds> {
    const row = await this.prisma.deviceConfig.findUnique({ where: { id: 1 } });
    if (!row)
      throw new BadRequestException('Device credentials not configured');
    return {
      ip: row.ip,
      username: row.username,
      password: this.decrypt(row.passwordEnc),
    };
    // lastEventTime is stored/updated separately
  }

  async getLastEventTime(): Promise<string | null> {
    const row = await this.prisma.deviceConfig.findUnique({ where: { id: 1 } });
    return row?.lastEventTime ?? null;
  }

  async setLastEventTime(ts: string) {
    await this.prisma.deviceConfig.update({
      where: { id: 1 },
      data: { lastEventTime: ts },
    });
  }

  async getClient(): Promise<DigestFetch> {
    const { username, password } = await this.getOrThrow();
    return new DigestFetch(username, password);
  }
}
