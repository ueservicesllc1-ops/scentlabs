import { z } from "zod";

export const CustomLabelSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  customerId: z.string().min(1),
  orderId: z.string().optional(),
  labelSize: z.string().min(1),
  material: z.enum([
    "vinyl_matte",
    "vinyl_glossy",
    "foil_gold",
    "foil_silver",
    "foil_rose_gold",
    "foil_holographic",
  ]),
  quantity: z.number().int().positive(),
  brandName: z.string().optional(),
  fragranceName: z.string().optional(),
  text: z.string().optional(),
  logoB2Key: z.string().optional(),
  designB2Key: z.string().optional(),
  previewUrl: z.string().url().optional(),
  status: z.enum(["draft", "pending_approval", "approved", "in_print", "completed"]).default("draft"),
  price: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
