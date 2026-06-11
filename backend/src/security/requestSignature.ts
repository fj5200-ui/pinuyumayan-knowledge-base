import crypto from 'node:crypto';
import type { Request } from 'express';

export function verifyRequestSignature(req: Request, secret: string) {
  const timestamp = req.header('x-pinuyumayan-request-timestamp');
  const nonce = req.header('x-pinuyumayan-request-nonce');
  const signature = req.header('x-pinuyumayan-signature');
  if (!timestamp || !nonce || !signature) return false;
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const bodySha = crypto.createHash('sha256').update(body).digest('hex');
  const payload = [req.method.toUpperCase(), req.path, timestamp, nonce, bodySha].join(':');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
