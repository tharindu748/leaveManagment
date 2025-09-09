import { Injectable } from '@nestjs/common';
// import { Prisma, User } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';

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
}
