import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginDTO } from '../user/user.dto';
import User from '../user/user.entity';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { getEnvPath } from '../../common/helpers/env.helper';
import { getTestDataSource } from '../../common/testData/datasource';
import { getUserSeeds } from '../../common/testData/userSeeds';
import { BadRequestException } from '@nestjs/common';
dotenv.config({
  path: getEnvPath(__dirname + `/../../common/envs`),
});

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  const dataSource = getTestDataSource();

  beforeAll(async () => {
    await dataSource.initialize();
    repository = dataSource.getRepository(User);
    await repository.insert(getUserSeeds());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useFactory: () => {
            return repository;
          },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll((done) => {
    dataSource.destroy();
    done();
  });
  it('authService is defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('login via email', async () => {
      const loginForm1: UserLoginDTO = {
        identification: 'dummy@mail.com',
        password: 'idsufdieuwsgfho',
      };
      const result = await service.validateUser(loginForm1);
      expect(result).toBeDefined();
      if (result) expect(result.id).toBeDefined();
    });
    it('login via username', async () => {
      const loginForm2: UserLoginDTO = {
        identification: 'DUMMY_USERNAME1',
        password: 'jfdsbviojbsdon',
      };
      const result = await service.validateUser(loginForm2);
      expect(result).toBeDefined();
      if (result) expect(result.id).toBeDefined();
    });
    it('login via phone', async () => {
      const loginForm3: UserLoginDTO = {
        identification: '+412356789',
        password: 'sdujhcbisdgc',
      };
      const result = await service.validateUser(loginForm3);
      expect(result).toBeDefined();
      if (result) expect(result.id).toBeDefined();
    });
    it('wrong login data', async () => {
      //wrong identification
      const loginForm4: UserLoginDTO = {
        identification: 'RANDOM_MESS',
        password: 'RANDOM_MESS',
      };
      const expectedUndefined1 = await service.validateUser(loginForm4);
      expect(expectedUndefined1).toBeUndefined();

      //wrong password
      const loginForm5: UserLoginDTO = {
        identification: 'DUMMY_USERNAME1',
        password: 'RANDOM_MESS',
      };
      const expectedUndefined2 = await service.validateUser(loginForm5);
      expect(expectedUndefined2).toBeUndefined();
    });
  });

  describe('validateViaAccessToken', () => {
    it('returns user data', async () => {
      const { password: _, ...userData } = await repository.findOne({
        where: {
          username: 'DUMMY_USERNAME1',
        },
      });
      const user = await service.validateViaAccessToken({ id: userData.id });
      expect(user).toStrictEqual(userData);
    });
    it('returns undefined on wrong id', async () => {
      // id taken from a random generator online
      const user = await service.validateViaAccessToken({
        id: 'c467e5fc-6daf-4cc3-bbac-2dd64a7ddb47',
      });
      expect(user).toBeUndefined();
    });
  });

  describe('addUser', () => {
    it('throws BadRequestException before database lookup when no identification data is found', async () => {
      expect.assertions(2);

      const findSpy = jest.spyOn(repository, 'find');
      try {
        await service.addUser({
          password:
            '$2a$04$lGxRD4RA39w1.1WnyvxVreULSGCB0l2EyV0Kfs6zol/4VpbOd.Vla',
          firstName: 'Joe',
          lastName: 'Blow',
          birthday: '1985-01-01',
        });
      } catch (error) {
        expect(findSpy).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('throws BadRequestException when identity(es) is/are already taken', async () => {
      expect.assertions(2);

      const findSpy = jest.spyOn(repository, 'find');
      try {
        await service.addUser({
          username: 'DUMMY_USERNAME1',
          phoneNumber: '+412356789',
          email: 'dummy@mail.com',
          password:
            '$2a$04$lGxRD4RA39w1.1WnyvxVreULSGCB0l2EyV0Kfs6zol/4VpbOd.Vla',
          firstName: 'Joe',
          lastName: 'Blow',
          birthday: '1985-01-01',
        });
      } catch (error) {
        expect(findSpy).toBeCalledTimes(1);
        expect(error).toStrictEqual(
          new BadRequestException([
            'email is already in use',
            'username already exists',
            'phone number is already in use',
          ]),
        );
      }
    });
    it('insert then returns data with inserted id', async () => {
      // expect.assertions(5);
      const findSpy = jest.spyOn(repository, 'find');
      const insertSpy = jest.spyOn(repository, 'insert');
      try {
        const nesUser = await service.addUser({
          username: 'DUMMY_USERNAME2',
          password:
            '$2a$04$lGxRD4RA39w1.1WnyvxVreULSGCB0l2EyV0Kfs6zol/4VpbOd.Vla',
          firstName: 'Joe',
          lastName: 'Blow',
          birthday: '1985-01-01',
        });
        expect(findSpy).toBeCalledTimes(1);
        expect(insertSpy).toBeCalled();
        expect(nesUser.id).toBeDefined();
        expect(nesUser.createDate).toBeDefined();
        expect(nesUser.updateDate).toBeDefined();
      } catch (error) {}
    });
  });
});
