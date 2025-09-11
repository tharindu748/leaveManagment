import { IsString, Matches } from 'class-validator';

export class CalculateAttendanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'workDate must be in the format YYYY-MM-DD',
  })
  workDate: string; // YYYY-MM-DD
}
