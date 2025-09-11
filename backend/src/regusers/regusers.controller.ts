import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { RegusersService } from './regusers.service';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/regusers.dto';

@Controller('regusers')
export class RegusersController {
  constructor(private readonly usersService: RegusersService) {}

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
