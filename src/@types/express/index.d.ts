import { Express } from 'express';

// add id and username fields to Request object
declare global{
  namespace Express {
      interface Request {
          id?: string;
          username: string;
      }
  }
}