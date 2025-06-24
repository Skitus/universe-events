import { z } from 'zod';

const single = z.object({
  eventId: z.string(),
  timestamp: z.string(),
  source: z.enum(['facebook', 'tiktok']),
  funnelStage: z.enum(['top', 'bottom']),
  eventType: z.string(),
  data: z.unknown(),
});

export const eventSchema = z.union([single, z.array(single)]);
export type EventDto = z.infer<typeof single>;
