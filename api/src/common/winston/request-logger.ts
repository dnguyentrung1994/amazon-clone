import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { format } from 'date-fns';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLogger implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { statusCode } = context.switchToHttp().getResponse();

    const { ip, method, url, query, body } = req;
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        Logger.verbose({
          time: format(now, 'Pppp'),
          client: ip,
          method,
          url,
          statusCode,
          message: { ...query, ...body },
          resolveTime: Date.now() - now + 'ms',
        });
      }),
    );
  }
}
