import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.databaseService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.databaseService.user.update({
      where: { id },
      data,
    });
  }

  // new
  async listUsers() {
    return this.databaseService.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async upsertRegUser(dto: CreateRegUserDto) {
    const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    const validTo = dto.validTo ? new Date(dto.validTo) : undefined;

    const user = await this.databaseService.user.upsert({
      where: { employeeId: dto.employeeId },
      update: {
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
        epfNo: dto.epfNo,
        nic: dto.nic,
        jobPosition: dto.jobPosition,
      },
      create: {
        employeeId: dto.employeeId,
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
        epfNo: dto.epfNo,
        nic: dto.nic,
        jobPosition: dto.jobPosition,
        email: `${dto.employeeId}@placeholder.local`,
        password: 'TEMP_PASSWORD',
      },
    });

    return user;
  }

  async updateRegUserFields(employeeId: string, dto: UpdateRegUserDto) {
    return this.databaseService.user.update({
      where: { employeeId },
      data: dto,
    });
  }
}
