import { z } from "zod";
import { CONTENT_TYPES, CRYPTO_ASSETS, INVESTOR_TYPES } from "@/lib/constants";

const assetSymbols = CRYPTO_ASSETS.map((a) => a.symbol) as [string, ...string[]];
const investorTypes = INVESTOR_TYPES as [string, ...string[]];
const contentTypes = CONTENT_TYPES as [string, ...string[]];

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const preferencesSchema = z.object({
  assets: z
    .array(z.enum(assetSymbols))
    .min(1, "Select at least one asset")
    .max(8),
  investorType: z.enum(investorTypes, {
    error: "Select an investor type",
  }),
  contentTypes: z
    .array(z.enum(contentTypes))
    .min(1, "Select at least one content type"),
});

export const feedbackSchema = z.object({
  section: z.enum(["NEWS", "PRICE", "AI_INSIGHT", "MEME"]),
  rating: z.enum(["UP", "DOWN"]),
  itemId: z.string().trim().min(1).optional(),
});
