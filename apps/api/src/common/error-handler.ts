import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./http-error.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: process.env.NODE_ENV === "production" ? undefined : error.details
    });
  }

  return res.status(500).json({
    error: "Erreur serveur",
    details: process.env.NODE_ENV === "production" ? undefined : error.message
  });
};
