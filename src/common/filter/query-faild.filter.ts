import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response, Request } from 'express';

import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryExeptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = 400;

    let message = '데이터베이스 에러';

    if (exception.message.includes('duplicate key')) {
      message = '중복 키 에러';
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    });
  }
}
