import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = ({ req }: { req:Request } ) => {
  let token = req.headers.authorization || req.body.token || req.query.token;

  if (req.headers.authorization) {
     token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  const secretKey = process.env.JWT_SECRET_KEY || '';

  try {
    const { data }: any = jwt.verify(token, secretKey, { maxAge: '1h'});
    req.user = data as JwtPayload;;
  } catch (err) {
    console.error(err);
  }
  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign({data: payload}, secretKey, { expiresIn: '1h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'UNAUTHENTICATED' });
  }
}
