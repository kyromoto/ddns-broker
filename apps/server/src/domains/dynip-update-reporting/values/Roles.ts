import { z } from "zod"


export const Roles = z.enum(['admin', 'user'])