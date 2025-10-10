import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  role: Role;
  type: 'access' | 'refresh';
}

export interface JwtUser {
  userId: number;
  role: string;
}
