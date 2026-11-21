import { Request, Response, NextFunction } from 'express';

// Disallowed NoSQL Injection & SQL Injection tokens
const DANGEROUS_KEY_REGEX = /^\$|\./;
const SQLI_REGEX = /\b(UNION\s+SELECT|OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+|DROP\s+TABLE|--)\b/i;
const XSS_REGEX = /<\s*script[^>]*>|javascript:\s*|on(error|load)\s*=/i;

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block MongoDB operator injection ($gt, $ne, $where, etc.)
    if (DANGEROUS_KEY_REGEX.test(key)) {
      continue;
    }
    if (typeof value === 'string') {
      // Check for SQLi / XSS signatures
      if (SQLI_REGEX.test(value) || XSS_REGEX.test(value)) {
        continue;
      }
      cleaned[key] = value;
    } else if (typeof value === 'object') {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );
  next();
}

export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}
