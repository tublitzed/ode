import type { RequestHandler } from "express";

import type { Db } from "#/server/db.ts";

export type ServerContext = {
  db: Db;
};

declare global {
  namespace Express {
    interface Request {
      context: ServerContext;
    }
  }
}

export const createContextMiddleware =
  (context: ServerContext): RequestHandler =>
  (req, _res, next) => {
    req.context = context;
    next();
  };
