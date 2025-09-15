import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResultDto> {
    const { name, password, email } = registerDto;

    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const createUserDto: CreateUserDto = {
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
    };

    const user = await this.usersService.create(createUserDto);

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.isAdmin,
      user.employeeId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      employeeId: user.employeeId,
    };
  }

  async validateUser(loginDto: LoginDto): Promise<{
    userId: number;
    email: string;
    isAdmin: boolean;
    employeeId: string | null;
  } | null> {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) return null;

    return {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      employeeId: user.employeeId,
    };
  }

  async login(user: {
    userId: number;
    email: string;
    isAdmin: boolean;
    employeeId: string;
  }): Promise<AuthResultDto> {
    const tokens = await this.getTokens(
      user.userId,
      user.email,
      user.isAdmin,
      user.employeeId,
    );
    await this.updateRefreshToken(user.userId, tokens.refreshToken);
    return {
      ...tokens,
      userId: user.userId,
      email: user.email,
      isAdmin: user.isAdmin,
      employeeId: user.employeeId,
    };
  }

  async logout(userId: number) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthResultDto> {
    const user = await this.usersService.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.isAdmin,
      user.employeeId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      employeeId: user.employeeId,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      this.SALT_ROUNDS,
    );
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(
    userId: number,
    email: string,
    isAdmin: boolean,
    employeeId: string | null,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          isAdmin,
          employeeId,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
