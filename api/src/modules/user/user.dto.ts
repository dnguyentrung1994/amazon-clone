import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { parseISO } from 'date-fns';
import { IUser } from './user.interface';

export class UserSignUpDTO implements Omit<IUser, 'id' | 'addresses'> {
  @ApiProperty({
    description: "user's email address",
    example: 'dummy@data.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "user's password", example: 'wiyegavsdfcs' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "user's first name", example: '' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "user's last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: "user's birthday" })
  @Transform(({ value }) => parseISO(value))
  @IsDate()
  birthday: Date;
}
