import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IUser } from './user.interface';

@Entity('user')
@Unique('userIdentity', ['email', 'username', 'phoneNumber'])
export default class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid', { name: 'userID' })
  id: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('date')
  birthday: string;

  @Column({ array: true, default: [], type: 'text' })
  addresses: string[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createDate: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateDate: Date;

  @DeleteDateColumn({ type: 'timestamp without time zone' })
  deletedAt?: Date;
}
