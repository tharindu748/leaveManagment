import { LeaveType } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class UpdateLeavePolicyDto {
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsInt()
  defaultBalance: number;
}
