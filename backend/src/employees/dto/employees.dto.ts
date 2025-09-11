import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeId: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
