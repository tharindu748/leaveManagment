import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.listUsers();
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
