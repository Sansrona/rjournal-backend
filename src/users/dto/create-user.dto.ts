import { UserEntity } from './../entities/user.entity';
import { IsEmail, Length } from 'class-validator';
import { UniqueOnDatabase } from 'src/auth/validations/UniqueValidation';

export class CreateUserDto {
  fullName: string;
  @IsEmail(undefined, { message: 'Некорректный email' })
  @UniqueOnDatabase(UserEntity, { message: 'Данный email уже занят' })
  email: string;
  @Length(6, 20, { message: 'Длина пароля не менее 6 символов' })
  password?: string;
}
