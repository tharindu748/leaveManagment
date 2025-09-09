import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';
import { HalfdayType } from '@prisma/client';

export class LeaveDateDto {
  @IsDate()
  date: Date;

  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @IsEnum(HalfdayType)
  @IsOptional()
  halfDayType?: HalfdayType;
}
