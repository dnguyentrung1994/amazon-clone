import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IUser } from './user.interface';

@Entity('user')
export default class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  birthday: Date;

  @Column({ array: true, default: [], type: 'text' })
  addresses: string[];
}
