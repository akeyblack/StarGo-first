import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const UserIP = createParamDecorator((data, req: Request) => {
  return null;
});