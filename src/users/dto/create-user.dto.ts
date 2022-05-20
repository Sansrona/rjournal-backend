import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  fullName: string;
  @IsEmail(undefined, { message: 'Некорректный email' })
  email: string;
  @Length(6, 20, { message: 'Длина пароля не менее 6 символов' })
  password?: string;
}
