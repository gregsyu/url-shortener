import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../../url/dto/url.dto';

export const User = createParamDecorator(
  (_, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
