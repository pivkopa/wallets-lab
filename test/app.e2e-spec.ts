import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateWalletDto, EditWalletDto } from 'src/wallet/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'some@email.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw exeprion if email empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw exeprion if password empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw exeprion if there is no body', () => {
        return pactum.spec().post('auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('should throw exeprion if password empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw exeprion if there is no body', () => {
        return pactum.spec().post('auth/signin').expectStatus(400);
      });

      it('should throw exeprion if email empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit current user', () => {
        const dto: EditUserDto = {
          firstName: 'SomeGoodName',
          email: 'someGood@email.com',
        };
        return pactum
          .spec()
          .patch('users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('Wallets', () => {
    describe('Get empty wallets', () => {
      it('should get wallets', () => {
        return pactum
          .spec()
          .get('wallets')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create wallet', () => {
      const dto: CreateWalletDto = {
        address: '0x123',
        type: 'embeded',
        blockchain: 'btc',
      };
      it('should create wallet', () => {
        return pactum
          .spec()
          .post('wallets')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('walletId', 'id');
      });
    });

    describe('Get wallets', () => {
      it('should get wallets', () => {
        return pactum
          .spec()
          .get('wallets')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get wallet by id', () => {
      it('should get wallet by id', () => {
        return pactum
          .spec()
          .get('wallets/{id}')
          .withPathParams('id', '$S{walletId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{walletId}')
          .inspect();
      });
    });

    describe('Get by address', () => {});

    describe('Edit wallet', () => {
      const dto: EditWalletDto = {
        type: 'created',
      };
      it('should get wallet by id', () => {
        return pactum
          .spec()
          .patch('wallets/{id}')
          .withPathParams('id', '$S{walletId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.type);
      });
    });

    describe('Delete wallet', () => {
      it('should delete wallet by id', () => {
        return pactum
          .spec()
          .delete('wallets/{id}')
          .withPathParams('id', '$S{walletId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('wallets')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});

//security, cluster mode pm2. integration testing, unit testing
