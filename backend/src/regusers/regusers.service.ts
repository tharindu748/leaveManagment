import { Injectable } from '@nestjs/common';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/regusers.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RegusersService {
  constructor(private prisma: DatabaseService) {}

  async listUsers() {
    return this.prisma.registeredUser.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async upsertRegUser(dto: CreateRegUserDto) {
    const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    const validTo = dto.validTo ? new Date(dto.validTo) : undefined;
    const user = await this.prisma.registeredUser.upsert({
      where: { employeeId: dto.employeeId },
      update: {
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
      },
      create: {
        employeeId: dto.employeeId,
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
      },
    });
    // Sync to employees
    await this.prisma.employee.upsert({
      where: { employeeId: dto.employeeId },
      update: { fullName: dto.name },
      create: { employeeId: dto.employeeId, fullName: dto.name },
    });
    return user;
  }

  async updateRegUserFields(employeeId: string, dto: UpdateRegUserDto) {
    return this.prisma.registeredUser.update({
      where: { employeeId },
      data: dto,
    });
  }
}
