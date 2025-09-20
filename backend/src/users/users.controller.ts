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

  // new
  // DELETE /users/:employeeNo
  @Delete(':employeeNo')
  async deleteUser(
    @Param('employeeNo') employeeNo: string,
    @Body() dto: DeleteUserDto,
  ) {
    const results = await this.usersService.deleteUserAcrossDevices(
      employeeNo,
      dto.devices,
      dto.httpScheme,
      dto.port,
    );

    // Summarize per device (last attempt per device)
    const summary = Object.values(
      results.reduce<Record<string, any>>((acc, r) => {
        acc[r.device] = {
          device: r.device,
          ok: r.ok,
          status: r.status,
          url: r.url,
          attempt: r.attempt,
          response: r.responseText?.slice(0, 4000), // avoid huge payloads
        };
        return acc;
      }, {}),
    );

    return { employeeNo, summary };
  }
}
