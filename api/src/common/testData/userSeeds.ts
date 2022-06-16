import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import User from '../../modules/user/user.entity';

export const getUserSeeds = (): QueryDeepPartialEntity<User>[] => [
  // raw password: jfdsbviojbsdon
  {
    username: 'DUMMY_USERNAME1',
    password: '$2a$04$lGxRD4RA39w1.1WnyvxVreULSGCB0l2EyV0Kfs6zol/4VpbOd.Vla',
    firstName: 'John',
    lastName: 'Doe',
    birthday: '1990-01-01',
    addresses: [],
  },
  // raw password: sdujhcbisdgc
  {
    phoneNumber: '+412356789',
    password: '$2a$04$04bTbOA7aM8gjIYyKI/LA.rhdTRpHM2ySEvhEhCgiXh4.KIP7OfJS',
    firstName: 'Jane',
    lastName: 'Doe',
    birthday: '1980-01-01',
    addresses: [],
  },
  //raw password: idsufdieuwsgfho
  {
    email: 'dummy@mail.com',
    password: '$2a$04$IIeXfRTF/hIJpw8Ns/oLAuAvMIHeisO1okDSnVFCevaGA.y66/xqK',
    firstName: 'Alan',
    lastName: 'Fresco',
    birthday: '1970-01-01',
    addresses: [],
  },
];
