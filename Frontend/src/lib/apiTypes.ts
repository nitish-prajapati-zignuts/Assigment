/**
 * API Response Types & Validation
 * Provides type-safe API response handling with runtime validation
 */

import { z } from 'zod';

/**
 * Generic API Response Schema
 */
const apiResponseSchema = z.object({
  status: z.number().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
});

/**
 * API Error Response Schema
 */
const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string(),
  statusCode: z.number(),
  details: z.any().optional(),
});

export type APIError = z.infer<typeof apiErrorSchema>;

/**
 * Meeting Types
 */
export const meetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  type: z.string(),
  participants: z.array(z.string()),
  transcript: z.string().optional().nullable(),
  summary: z.any().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Meeting = z.infer<typeof meetingSchema>;

export const meetingListResponseSchema = z.object({
  data: z.array(meetingSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    totalPages: z.number(),
  }),
});

export type MeetingListResponse = z.infer<typeof meetingListResponseSchema>;

/**
 * Action Item Types
 */
export const actionItemSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  userId: z.string().nullable().optional(),
  task: z.string(),
  owner: z.string(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ActionItem = z.infer<typeof actionItemSchema>;

export const actionItemListResponseSchema = z.object({
  data: z.array(actionItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    totalPages: z.number(),
  }),
});

export type ActionItemListResponse = z.infer<typeof actionItemListResponseSchema>;

/**
 * User Types
 */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

/**
 * Auth Response Types
 */
export const authResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * Validate API response against schema
 */
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(data);
}

/**
 * Safe validation wrapper
 */
export function validateResponseSafe<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ')}`,
      };
    }
    return {
      success: false,
      error: 'Unknown validation error',
    };
  }
}

/**
 * Check if response is an error
 */
export function isAPIError(data: unknown): data is APIError {
  try {
    apiErrorSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    if (error.message && error.message !== 'Request validation failed') {
      return error.message;
    }
    if (error.details && typeof error.details === 'object' && Object.keys(error.details).length > 0) {
      const firstDetail = Object.values(error.details)[0];
      if (typeof firstDetail === 'string' && firstDetail) return firstDetail;
    }
    return error.message || error.error;
  }

  if (error && typeof error === 'object') {
    const errObj = error as any;
    const responseData = errObj.response?.data || errObj.data;

    if (responseData) {
      if (responseData.message && responseData.message !== 'Request validation failed') {
        return responseData.message;
      }
      if (responseData.details && typeof responseData.details === 'object' && Object.keys(responseData.details).length > 0) {
        const firstDetail = Object.values(responseData.details)[0];
        if (typeof firstDetail === 'string' && firstDetail) return firstDetail;
      }
      if (responseData.message) return responseData.message;
      if (responseData.error && typeof responseData.error === 'string') return responseData.error;
    }

    if (errObj.message && typeof errObj.message === 'string') {
      return errObj.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}
