import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().trim().optional()
});

export const getPagination = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit
});

export const pageMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  pageCount: Math.max(1, Math.ceil(total / limit))
});
