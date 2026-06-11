import crypto from 'node:crypto';

export type HmacNonceVerificationInput = {
  method: string;
  pathWithQuery: string;
  timestamp: string;
  nonce: string;
  body: string;
  signature: string;
  secret: string;
  nowMs?: number;
  toleranceSeconds?: number;
};

export type HmacNonceVerificationResult =
  | { ok: true; bodyHash: string; signatureBase: string }
  | { ok: false; reason: 'missing_header' | 'timestamp_out_of_range' | 'signature_mismatch'; bodyHash?: string };

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function signInternalRequest(input: Omit<HmacNonceVerificationInput, 'signature' | 'nowMs' | 'toleranceSeconds'>): string {
  const bodyHash = sha256Hex(input.body || '');
  const signatureBase = [input.method.toUpperCase(), input.pathWithQuery, input.timestamp, input.nonce, bodyHash].join('\n');
  return crypto.createHmac('sha256', input.secret).update(signatureBase, 'utf8').digest('hex');
}

export function verifyHmacNonce(input: HmacNonceVerificationInput): HmacNonceVerificationResult {
  if (!input.timestamp || !input.nonce || !input.signature || !input.secret) {
    return { ok: false, reason: 'missing_header' };
  }
  const tolerance = (input.toleranceSeconds ?? 300) * 1000;
  const now = input.nowMs ?? Date.now();
  const ts = Number(input.timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > tolerance) {
    return { ok: false, reason: 'timestamp_out_of_range' };
  }
  const bodyHash = sha256Hex(input.body || '');
  const signatureBase = [input.method.toUpperCase(), input.pathWithQuery, input.timestamp, input.nonce, bodyHash].join('\n');
  const expected = crypto.createHmac('sha256', input.secret).update(signatureBase, 'utf8').digest('hex');
  const actual = input.signature.toLowerCase();
  const ok = expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  return ok ? { ok: true, bodyHash, signatureBase } : { ok: false, reason: 'signature_mismatch', bodyHash };
}
