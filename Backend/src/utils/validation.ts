/**
 * Zod Validation Schemas
 * Centralized validation schemas for all API requests
 */

import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

// Meeting Schemas
export const createMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  date: z.string().min(1, 'Date is required'),
  participants: z.array(z.string().email('Each participant must have a valid email')).min(1, 'At least one participant is required'),
  transcript: z.string()
    .min(10, 'Transcript must be at least 10 characters')
    .max(50000, 'Transcript must not exceed 50,000 characters')
    .optional()
    .nullable(),
  type: z.string().optional(),
  summaryLength: z.string().optional(),
});

export const updateMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  date: z.string().optional(),
  participants: z.array(z.string().email('Each participant must have a valid email')).optional(),
  transcript: z.string()
    .min(10, 'Transcript must be at least 10 characters')
    .max(50000, 'Transcript must not exceed 50,000 characters')
    .optional()
    .nullable(),
  type: z.string().optional(),
  summaryLength: z.string().optional(),
});

export const meetingQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).default(1),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).default(10),
  search: z.string().max(100, 'Search query too long').optional(),
  type: z.enum(['meeting', 'standup', 'presentation', 'workshop', 'other']).optional(),
  sortBy: z.enum(['date', 'createdAt', 'title']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Action Item Schemas
export const createActionItemSchema = z.object({
  task: z.string()
    .min(1, 'Task is required')
    .max(500, 'Task must not exceed 500 characters')
    .trim(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  meetingId: z.string().min(1, 'Meeting ID is required'),
});

export const updateActionItemSchema = z.object({
  task: z.string()
    .min(1, 'Task is required')
    .max(500, 'Task must not exceed 500 characters')
    .trim()
    .optional(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
});

export const actionItemQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).default(1),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).default(10),
  status: z.string().optional(),
  priority: z.string().optional(),
  meetingId: z.string().optional(),
  sortBy: z.string().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ID Validation
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type MeetingQueryInput = z.infer<typeof meetingQuerySchema>;
export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
export type ActionItemQueryInput = z.infer<typeof actionItemQuerySchema>;
