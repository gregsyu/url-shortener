import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  IsEmail,
  IsDate,
} from 'class-validator';

export class CreateUrlDto {
  @IsUrl({
    require_protocol: false,
  })
  url!: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  customCode?: string;
}

export class UserPayload {
  @IsEmail()
  email!: string;

  sub!: string;
}

export class UrlStats {
  @IsString()
  code!: string;

  @IsString()
  originalUrl!: string;

  clicks!: number;

  @IsDate()
  createdAt!: Date;
}
