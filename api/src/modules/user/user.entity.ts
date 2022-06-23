import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IUser } from './user.interface';

@Entity('user')
export default class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid', { name: 'userID' })
  id: string;

  @Column({ nullable: true })
  @Index({ unique: true, where: '"email" is not NULL' })
  email?: string;

  @Column({ nullable: true })
  @Index({ unique: true, where: '"username" is not NULL' })
  username?: string;

  @Column({ nullable: true })
  @Index({ unique: true, where: '"phoneNumber" is not NULL' })
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
