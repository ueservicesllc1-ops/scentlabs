import { z } from "zod";

export const CustomerAddressSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default("USA"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const CustomerSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin"]).default("customer"),
  addresses: z.array(CustomerAddressSchema).default([]),
  defaultShippingAddressId: z.string().optional(),
  defaultBillingAddressId: z.string().optional(),
  savedDesignIds: z.array(z.string()).default([]),
  totalOrdersCount: z.number().int().nonnegative().default(0),
  totalSpent: z.number().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
