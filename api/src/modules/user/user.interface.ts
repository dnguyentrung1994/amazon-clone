export interface IUser {
  id: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: string;
  addresses: string[];
}

export interface IUserSignUp {
  email?: string;
  username?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  // addresses: string[];
}
