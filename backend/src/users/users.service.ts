import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import DigestFetch from 'digest-fetch';

type DeleteResult = {
  device: string;
  ok: boolean;
  status?: number;
  url?: string;
  attempt: 'UserInfo/Delete' | 'UserInfoDetail/Delete';
  responseText?: string;
};

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;
  constructor(private databaseService: DatabaseService) {}

  // new 2
  private readonly user = process.env.HIK_USER ?? 'admin';
  private readonly pass = process.env.HIK_PASS ?? '';
  private readonly scheme = (process.env.HIK_HTTP_SCHEME ?? 'http') as
    | 'http'
    | 'https';
  private readonly port = Number(
    process.env.HIK_PORT ?? (this.scheme === 'https' ? 443 : 80),
  );
  private readonly rejectTLS =
    (process.env.HIK_TLS_REJECT_UNAUTHORIZED ?? 'false') === 'true';

  async findUserByEmail(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmployeeId(employeeId: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { employeeId },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.databaseService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.databaseService.user.update({
      where: { id },
      data,
    });
  }

  // new
  async listUsers() {
    return this.databaseService.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async upsertRegUser(dto: CreateRegUserDto) {
    const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    const validTo = dto.validTo ? new Date(dto.validTo) : undefined;

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await this.databaseService.user.upsert({
      where: { employeeId: dto.employeeId },
      update: {
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
        epfNo: dto.epfNo,
        nic: dto.nic,
        jobPosition: dto.jobPosition,
      },
      create: {
        employeeId: dto.employeeId,
        name: dto.name,
        cardNumber: dto.cardNumber,
        validFrom,
        validTo,
        epfNo: dto.epfNo,
        nic: dto.nic,
        jobPosition: dto.jobPosition,
        email: `${dto.employeeId}@placeholder.local`,
        password: hashedPassword,
      },
    });

    return user;
  }

  async updateRegUserFields(employeeId: string, dto: UpdateRegUserDto) {
    return this.databaseService.user.update({
      where: { employeeId },
      data: dto,
    });
  }

  // new 2
  // Build base URL like http://192.168.1.50:80
  private base(device: string, scheme?: 'http' | 'https', port?: number) {
    const s = scheme ?? this.scheme;
    const p = port ?? this.port;
    return `${s}://${device}${p ? `:${p}` : ''}`;
  }

  private client() {
    const opts: any = {};
    if (!this.rejectTLS) {
      // allow self-signed devices unless env says otherwise
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    return new DigestFetch(this.user, this.pass, opts);
  }

  private async tryDeleteOnce(
    device: string,
    employeeNo: string,
    node: 'UserInfo/Delete' | 'UserInfoDetail/Delete',
    scheme?: 'http' | 'https',
    port?: number,
  ): Promise<DeleteResult> {
    const c = this.client();
    const url = `${this.base(device, scheme, port)}/ISAPI/AccessControl/${node}?format=json`;

    // two possible bodies across firmwares; we’ll try the more general one
    const body =
      node === 'UserInfoDetail/Delete'
        ? {
            UserInfoDetail: {
              mode: 'byEmployeeNo',
              EmployeeNoList: [{ employeeNo: employeeNo }],
            },
          }
        : {
            UserInfoDelCond: {
              EmployeeNoList: [{ employeeNo: employeeNo }],
            },
          };

    const res = await c.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const ok = res.ok;
    return {
      device,
      ok,
      status: res.status,
      url,
      attempt: node,
      responseText: text,
    };
  }

  async deleteUserAcrossDevices(
    employeeNo: string,
    devices: string[],
    scheme?: 'http' | 'https',
    port?: number,
  ) {
    const results: DeleteResult[] = [];
    for (const d of devices) {
      // 1) Try /UserInfo/Delete
      let r = await this.tryDeleteOnce(
        d,
        employeeNo,
        'UserInfo/Delete',
        scheme,
        port,
      );
      results.push(r);

      // 2) If failed, try /UserInfoDetail/Delete
      if (!r.ok) {
        r = await this.tryDeleteOnce(
          d,
          employeeNo,
          'UserInfoDetail/Delete',
          scheme,
          port,
        );
        results.push(r);
      }
    }
    return results;
  }
}
