import { format } from 'date-fns';
import { IUser, IUserSignUp } from 'src/modules/user/user.interface';

export function mapIUserSignUpToIUser(
  userData: IUserSignUp,
): Omit<IUser, 'id' | 'addresses'> {
  const { birthday } = userData;

  return {
    ...userData,
    birthday: format(birthday, 'yyyy-MM-dd'),
  };
}
