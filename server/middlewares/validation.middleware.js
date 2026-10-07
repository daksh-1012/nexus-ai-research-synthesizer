import { z } from 'zod';

// Authentication Schema
export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  fullName: z.string().optional()
});

// Project Creation Schema
export const projectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default('')
});

// Upload Validation Schema
export const uploadSchema = z.object({
  projectId: z.string().uuid('Valid project ID required'),
  analysisFocus: z.enum(['Summary', 'Data Extraction', 'Critique']).optional().default('Summary')
});

/**
 * Express middleware helper to validate request body against a Zod schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.validatedBody = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}
