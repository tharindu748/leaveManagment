import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateAttendanceConfigDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'workStart must be HH:mm format' })
  workStart: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'workEnd must be HH:mm format' })
  workEnd: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'otEnd must be HH:mm format' })
  otEnd: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'earlyStart must be HH:mm format' })
  earlyStart: string;
}
