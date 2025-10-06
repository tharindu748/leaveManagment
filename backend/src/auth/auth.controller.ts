import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { RegisterDto } from './dto/register.dto';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { RefreshTokenGuard } from './guards/passport-jwt-refresh.guard';
import type { Response, CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd, // boolean ✅
  sameSite: isProd ? 'none' : 'lax', // 'none' requires secure: true
  // path: '/',                                // optional
  // maxAge: 7 * 24 * 60 * 60 * 1000,          // optional (e.g., 7 days)
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } =
      await this.authService.register(registerDto);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(PassportLocalGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...result } = await this.authService.login(req.user);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return result;
  }

  @UseGuards(PassportJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user['userId']);
    res.clearCookie('refreshToken', {
      ...refreshCookieOptions,
      maxAge: undefined,
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    const { refreshToken: newRefreshToken, ...result } =
      await this.authService.refreshTokens(userId, refreshToken);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
    return result;
  }

  @Get('profile')
  @UseGuards(PassportJwtAuthGuard)
  async profile() {
    return { message: 'This is a private profile endpoint.' };
  }
}
