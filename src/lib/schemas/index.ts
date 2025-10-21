import { z } from "zod";

// Wine colour enum matching database
export const WineColourEnum = z.enum(["red", "white", "rosé", "sparkling", "other"]);
export type WineColour = z.infer<typeof WineColourEnum>;

// Country schemas
export const CountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Country name is required").max(100),
});

export const CreateCountrySchema = z.object({
  name: z.string().min(1, "Country name is required").max(100).trim(),
});

// Producer schemas
export const ProducerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Producer name is required"),
  country_id: z.string().uuid().nullable(),
  region: z.string().nullable(),
});

export const CreateProducerSchema = z.object({
  name: z.string().min(1, "Producer name is required").trim(),
  country_id: z.string().uuid().nullable(),
  region: z.string().max(200).trim().optional(),
});

// Wine schemas
export const WineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Wine name is required"),
  colour: WineColourEnum,
  producer_id: z.string().uuid(),
});

export const CreateWineSchema = z.object({
  name: z.string().min(1, "Wine name is required").trim(),
  colour: WineColourEnum,
  producer_id: z.string().uuid(),
});

// Bottle schemas
export const BottleSchema = z.object({
  id: z.string().uuid(),
  wine_id: z.string().uuid(),
  vintage: z.number().int().min(1900).max(new Date().getFullYear() + 5).nullable(),
  size: z.number().int().min(1, "Size must be positive"),
  price: z.number().int().min(0, "Price must be non-negative"),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  tags: z.array(z.string()).nullable(),
});

export const CreateBottleSchema = z.object({
  wine_id: z.string().uuid(),
  vintage: z.number().int().min(1900).max(new Date().getFullYear() + 5).nullable(),
  size: z.number().int().min(1, "Size must be positive"),
  price: z.number().int().min(0, "Price must be non-negative"),
  quantity: z.number().int().min(0, "Quantity must be non-negative").default(1),
  tags: z.array(z.string()).optional(),
});

export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type Producer = z.infer<typeof ProducerSchema>;
export type CreateProducer = z.infer<typeof CreateProducerSchema>;
export type Wine = z.infer<typeof WineSchema>;
export type CreateWine = z.infer<typeof CreateWineSchema>;
export type Bottle = z.infer<typeof BottleSchema>;
export type CreateBottle = z.infer<typeof CreateBottleSchema>;
