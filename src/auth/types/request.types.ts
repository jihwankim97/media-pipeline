import { Request } from 'express';
import { JwtPayload } from './jwt.types';
import { User } from 'src/user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User | JwtPayload;
}
