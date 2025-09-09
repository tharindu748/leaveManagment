import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LeaveType, LeaveStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { LeaveDateDto } from './leave_date.dto';

export class CreateLeaveRequestDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeaveDateDto)
  dates: LeaveDateDto[];
}
