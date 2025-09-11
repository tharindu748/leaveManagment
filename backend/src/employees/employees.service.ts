import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateEmployeeDto } from './dto/employees.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: DatabaseService) {}

  async addEmployee(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: dto });
  }
}
