import { IsEmail, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

export class SignInDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
