import type { Request, Response } from 'express';

export type DataMode = 'static' | 'db' | 'hybrid';

export function isProductionStaticFallbackDisabled(): boolean {
  return process.env.NODE_ENV === 'production' &&
    process.env.KNOWLEDGE_DATA_MODE === 'db' &&
    process.env.DISABLE_PRODUCTION_STATIC_FALLBACK !== 'false';
}

export function assertDbFallbackAllowedV28(req: Request, res: Response, routeGroup: string): boolean {
  if (!isProductionStaticFallbackDisabled()) {
    res.setHeader('x-pinuyumayan-data-mode', process.env.KNOWLEDGE_DATA_MODE ?? 'hybrid');
    res.setHeader('x-pinuyumayan-data-source', 'static-fallback-allowed');
    return true;
  }
  const requestId = String(req.headers['x-request-id'] ?? res.getHeader('x-request-id') ?? 'unknown');
  res.status(503).json({
    ok: false,
    code: 'DB_UNAVAILABLE_STATIC_FALLBACK_BLOCKED',
    message: 'Production is configured for DB mode; silent static fallback is blocked.',
    routeGroup,
    requestId
  });
  return false;
}

export function getDataModeStatusV28() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    knowledgeDataMode: process.env.KNOWLEDGE_DATA_MODE ?? 'hybrid',
    disableProductionStaticFallback: isProductionStaticFallbackDisabled(),
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    recommendedProduction: {
      NODE_ENV: 'production',
      KNOWLEDGE_DATA_MODE: 'db',
      DISABLE_PRODUCTION_STATIC_FALLBACK: 'true'
    }
  };
}
