import type { NextFunction, Request, Response } from "express";
import { type ZodTypeAny, z } from "zod";
import { HttpError } from "./http-error.js";

/**
 * Accepte ZodTypeAny (ZodObject, ZodEffects, ZodIntersection…) pour body/query/params.
 * Cela couvre tous les cas : .refine(), .superRefine(), .transform(), .pipe(), etc.
 * Précédemment limité à AnyZodObject, ce qui rejetait les ZodEffects au niveau TypeScript.
 */
type RequestSchema = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validate =
  (schema: RequestSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body) as z.infer<typeof schema.body>;
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as z.infer<typeof schema.query>;
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as z.infer<typeof schema.params>;
      }
      next();
    } catch (error) {
      next(new HttpError(422, "Validation invalide", error));
    }
  };
