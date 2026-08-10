/**
 * File Upload Validation & Security Middleware
 * Validates file uploads for size, type, and malicious content
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

/**
 * Allowed MIME types for meeting transcripts
 */
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.oasis.opendocument.text', // .odt
];

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = ['.txt', '.csv', '.pdf', '.docx', '.doc', '.odt'];

/**
 * Maximum file size (10MB default, configurable via env)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file upload
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  // This middleware validates the general request size
  // For multer integration, add specific file validation

  if (req.is('multipart/form-data')) {
    // File upload request - validate content-length
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  next();
};

/**
 * Validate file type and size after upload
 */
export const validateUploadedFile = (
  fieldName: string = 'file'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = (req as any).file;

    if (!file) {
      // File is optional
      return next();
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      logger.warn('File upload rejected: size too large', {
        fieldName,
        size: file.size,
        maxSize: MAX_FILE_SIZE,
      });
      throw new ValidationError(
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      logger.warn('File upload rejected: invalid MIME type', {
        fieldName,
        mimetype: file.mimetype,
        allowed: ALLOWED_MIME_TYPES,
      });
      throw new ValidationError(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    // Validate file extension
    const originalName = file.originalname || '';
    const fileExtension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      logger.warn('File upload rejected: invalid extension', {
        fieldName,
        extension: fileExtension,
        allowed: ALLOWED_EXTENSIONS,
      });
      throw new ValidationError(
        `File extension "${fileExtension}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    // Validate file content (basic checks)
    validateFileContent(file);

    logger.debug('File upload validated', {
      fieldName,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    next();
  };
};

/**
 * Validate file content for malicious patterns
 */
function validateFileContent(file: Express.Multer.File): void {
  if (!file.buffer) {
    return;
  }

  // Check for common malicious patterns
  const buffer = file.buffer;
  const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length)).toLowerCase();

  // Check for script tags or executable patterns (basic check)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
    /\.exe/i,
    /\.bat/i,
    /\.cmd/i,
    /\.com/i,
    /\.pif/i,
    /\.scr/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      logger.warn('File upload rejected: malicious content detected', {
        filename: file.originalname,
        pattern: pattern.source,
      });
      throw new ValidationError('File contains potentially malicious content and was rejected');
    }
  }
}

/**
 * Sanitize uploaded file content
 * Removes potentially dangerous content from text-based files
 */
export const sanitizeFileContent = (content: string): string => {
  // Remove script tags
  content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove event handlers
  content = content.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  content = content.replace(/javascript:/gi, '');

  // Remove null bytes
  content = content.replace(/\0/g, '');

  return content.trim();
};

/**
 * File upload configuration
 */
export const getFileUploadConfig = () => {
  return {
    maxFileSize: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    allowedExtensions: ALLOWED_EXTENSIONS,
  };
};
