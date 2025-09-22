import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/users.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.listUsers();
  }

  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string) {
    return this.usersService.findUserByEmployeeId(employeeId);
  }

  @Post()
  create(@Body() dto: CreateRegUserDto) {
    return this.usersService.upsertRegUser(dto);
  }

  @Patch(':employeeId')
  update(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateRegUserDto,
  ) {
    return this.usersService.updateRegUserFields(employeeId, dto);
  }
}
