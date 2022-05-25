import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCond({ email, password });
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  generateJwtToken(data: { id: number; email: string }) {
    const payload = { email: data.email, sub: data.id };
    return this.jwtService.sign(payload);
  }

  async login(user: any) {
    const { password, ...userData } = user;
    return {
      ...userData,
      access_token: this.generateJwtToken(userData),
    };
  }

  async register(dto: CreateUserDto) {
    try {
      const { password, ...user } = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
      });
      return {
        ...user,
        access_token: this.generateJwtToken(user),
      };
    } catch (error) {
      throw new ForbiddenException();
    }
  }
}
