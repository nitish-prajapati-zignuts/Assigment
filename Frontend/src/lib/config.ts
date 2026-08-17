/**
 * Environment Configuration & Validation
 * Validates and exposes all environment variables with type safety
 */

import { z } from "zod"
import { logger } from "./logger"

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_API_URL: z.string().default("http://localhost:4000/api"),
    NEXT_PUBLIC_SHOW_TEAM_CONRIBUTION: z
        .union([z.boolean(), z.string().transform((val) => val === "true")])
        .default(false)
})

export type EnvConfig = z.infer<typeof envSchema>

function validateEnv(): EnvConfig {
    try {
        const env = envSchema.parse({
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            NEXT_PUBLIC_SHOW_TEAM_CONRIBUTION: process.env.NEXT_PUBLIC_SHOW_TEAM_CONRIBUTION ?? process.env.NEXT_PUBLIC_SHOW_TEAM_CONRIBUTION,
        })
        return env
    } catch (error) {
        logger.error(
            "Environment validation failed. Please check environment variables.",
            error instanceof Error ? error : new Error(String(error))
        )
        throw error
    }
}

export const config = validateEnv()

export const getEnv = (key: keyof EnvConfig, fallback?: string): string => {
    const value = config[key];
    if (value === undefined && !fallback) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return String(value || fallback || "");
};

/**
 * Check if running in production
 */
export const isProduction = () => config.NODE_ENV === "production";
export const isDevelopment = () => config.NODE_ENV === "development";
export const isTest = () => config.NODE_ENV === "test";
