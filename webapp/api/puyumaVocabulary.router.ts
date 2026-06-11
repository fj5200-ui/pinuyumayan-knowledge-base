// tRPC example contract for Puyuma vocabulary entries with audio, G2P, IPA, TTS metadata.
import { z } from 'zod';

export const puyumaVocabularyQuerySchema = z.object({
  dialect: z.string().optional(),
  category: z.string().optional(),
  hasAudio: z.boolean().optional(),
  hasIpa: z.boolean().optional(),
  hasG2p: z.boolean().optional(),
  q: z.string().optional(),
  limit: z.number().min(1).max(100).default(30),
  cursor: z.string().optional(),
});

// Implement with your DB adapter. Important: public API should not enable TTS unless reviewed.
export type PuyumaVocabularyQuery = z.infer<typeof puyumaVocabularyQuerySchema>;
