import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { TransactionsModule } from './../src/transactions/transactions.module';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Reflector } from '@nestjs/core';

const dbUri = 'mongodb://localhost:27017/e2e_test';

const mockTransaction = {
  hash: '0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc',
  blockNumber: 12376729,
  gasPrice: '64000000000',
  gasUsed: '5201405',
  timestamp: 1620250931,
  transactionFee: 1139.6453122208,
};

beforeAll(async () => {
  await mongoose.connect(dbUri);
  const db = mongoose.connection.db;
  await db.collection('transactions').drop();
  await db.collection('transactions').insertOne(mockTransaction);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(dbUri), TransactionsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidUnknownValues: true,
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector), {
        excludeExtraneousValues: true,
      }),
    );
    await app.init();
  });

  describe('/transactions (GET)', () => {
    it('should return transactions with default limit and skip', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({ startTime: 1510250931, endTime: 1730250931 })
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toEqual(1);
          expect(body.limit).toEqual(10);
          expect(body.skip).toEqual(0);
          expect(body.results).toHaveLength(1);
        });
    });

    it('should throw an error is startTime or endTime is not sent', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toContain('startTime must be a positive number');
          expect(body.message).toContain('endTime must be a positive number');
        });
    });

    it('should set the limit properly', async () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({
          startTime: 1510250931,
          endTime: 1730250931,
          limit: 50,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toEqual(1);
          expect(body.limit).toEqual(50);
          expect(body.results).toHaveLength(1);
        });
    });

    it('should throw BadRequestException when limit is set to higher than 1000', async () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({
          startTime: 1510250931,
          endTime: 1730250931,
          limit: 2000,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toContain('limit must not be greater than 1000');
        });
    });

    it('should throw BadRequestException when a negative limit is set', async () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({
          startTime: 1510250931,
          endTime: 1730250931,
          limit: -10,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toContain('limit must be a positive number');
        });
    });

    it('should set the skip properly', async () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({
          startTime: 1510250931,
          endTime: 1730250931,
          skip: 1,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toEqual(1);
          expect(body.limit).toEqual(10);
          expect(body.skip).toEqual(1);
          expect(body.results).toHaveLength(0);
        });
    });

    it('should throw BadRequestException when a negative skip is set', async () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({
          startTime: 1510250931,
          endTime: 1730250931,
          skip: -10,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toContain('skip must not be less than 0');
        });
    });
  });

  describe('/transactions/{hash} (GET)', () => {
    it('should return a transaction when a valid hash is provided', () => {
      return request(app.getHttpServer())
        .get(
          '/transactions/0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc',
        )
        .expect(200)
        .expect(({ body }) => {
          expect(body.hash).toEqual(mockTransaction.hash);
        });
    });

    it('should throw NotFoundException when transaction is not found in the database', () => {
      return request(app.getHttpServer())
        .get(
          '/transactions/0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cb',
        )
        .expect(404);
    });

    it('should throw BadRequestException when an invalid hash is provided', () => {
      return request(app.getHttpServer())
        .get('/transactions/dummy')
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toContain('hash must be a valid ethereum hash');
        });
    });
  });
});
