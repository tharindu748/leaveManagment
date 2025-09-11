import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateSyncHistoryDto } from './dto/sync-history.dto';

@Injectable()
export class SyncHistoryService {
  constructor(private prisma: DatabaseService) {}

  async addRecord(dto: CreateSyncHistoryDto) {
    return this.prisma.syncHistory.create({ data: dto });
  }

  async listRecent(limit: number = 50) {
    return this.prisma.syncHistory.findMany({
      orderBy: { syncTime: 'desc' },
      take: limit,
    });
  }
}
