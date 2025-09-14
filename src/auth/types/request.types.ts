import { Request } from 'express';
import { JwtPayload } from './jwt.types';
import { QueryRunner } from 'typeorm';

export interface RequestWithUser extends Request {
  user: JwtPayload;

  queryRunner?: QueryRunner;
}
