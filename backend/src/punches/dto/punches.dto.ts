import { IsString, IsISO8601, IsIn, IsOptional } from 'class-validator';

export class CreatePunchDto {
  @IsString()
  employeeId: string;

  @IsISO8601({}, { message: 'eventTime must be a valid ISO date string' })
  eventTime: string; // ISO string

  @IsOptional()
  @IsIn(['IN', 'OUT'])
  direction?: 'IN' | 'OUT';

  @IsIn(['device', 'manual'])
  source: 'device' | 'manual';

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
