import { z } from "zod";

export const uuidSchema = z.string().uuid("Id must be a valid UUID");