export class AuthResultDto {
  accessToken: string;
  refreshToken: string;
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
  employeeId: string | null;
}
