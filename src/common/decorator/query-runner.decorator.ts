import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { RequestWithUser } from 'src/auth/types/request.types';

export const QueryRunner = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    if (!req || !req.queryRunner) {
      throw new InternalServerErrorException(
        'Query Runner 객체를 찾을 수 없습니다.',
      );
    }

    return req.queryRunner;
  },
);
