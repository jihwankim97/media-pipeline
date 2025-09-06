import { Role } from 'src/user/entities/user.entity';

export interface JwtPayload {
  sub: number;
  role: Role;
  type: 'access' | 'refresh';
}

export interface JwtUser {
  userId: number;
  role: string;
}
