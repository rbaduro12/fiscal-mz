import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nome: string;

  @IsString()
  nomeEmpresa: string;

  @IsString()
  @Length(9, 9)
  nuit: string;
}
