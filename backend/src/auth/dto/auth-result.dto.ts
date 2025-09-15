export class AuthResultDto {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  isAdmin: boolean;
  employeeId: string | null;
}
