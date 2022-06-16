import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { parseISO } from 'date-fns';
import { AtLeastOneNotEmptyString } from '../../common/decorators/customValidator/AtLeastOneNotEmptyString';
import { IUserSignUp } from './user.interface';

export class UserSignUpDTO implements IUserSignUp {
  /**
   * User's email address
   * @example 'abc@gmail.com'
   */
  @ValidateIf((object) => !object.username && !object.phoneNumber)
  @AtLeastOneNotEmptyString(['email', 'username', 'phoneNumber'], {
    message:
      "email is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
  })
  @IsEmail({})
  email?: string;
  /**
   * User's username
   * @example 'JohnDoe01'
   */
  @ValidateIf((object) => !object.email && !object.phoneNumber)
  @AtLeastOneNotEmptyString(['email', 'username', 'phoneNumber'], {
    message:
      "username is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
  })
  username?: string;
  /**
   * User's phone number
   * @example '+4123456789'
   */
  @ValidateIf((object) => !object.email && !object.username)
  @AtLeastOneNotEmptyString(['email', 'username', 'phoneNumber'], {
    message:
      "phone number is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
  })
  @IsPhoneNumber()
  phoneNumber?: string;

  /**
   * User's password
   * @example 's@mpl3P@ssw0rd'
   */
  @IsString()
  @IsNotEmpty()
  password: string;

  /**
   * User's first name
   * @example 'John'
   */
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /**
   * User's last name
   * @example 'Doe'
   */
  @IsString()
  @IsNotEmpty()
  lastName: string;

  /**
   * User's date of birth.
   * @example '1990-01-01'
   */
  @Transform(({ value }) => parseISO(value))
  @IsDate()
  birthday: Date;
}

export class UserLoginDTO {
  /**
   * User's identification
   * @example '+4123456789'
   */
  @IsString()
  @IsNotEmpty()
  identification: string;

  /**
   * User's password
   * @example 's@mpl3P@ssw0rd'
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
