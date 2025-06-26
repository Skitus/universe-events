import { z } from 'zod';

// Funnel stages
export const FunnelStage = z.enum(['top', 'bottom']);

// Facebook event types and schemas
export const FacebookTopEventType = z.enum(['ad.view', 'page.like', 'comment', 'video.view']);
export const FacebookBottomEventType = z.enum(['ad.click', 'form.submission', 'checkout.complete']);
export const FacebookEventType = z.union([FacebookTopEventType, FacebookBottomEventType]);

export const FacebookUserLocation = z.object({
  country: z.string(),
  city: z.string(),
});

export const FacebookUser = z.object({
  userId: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.enum(['male', 'female', 'non-binary']),
  location: FacebookUserLocation,
});

export const FacebookEngagementTop = z.object({
  actionTime: z.string(),
  referrer: z.enum(['newsfeed', 'marketplace', 'groups']),
  videoId: z.string().nullable(),
});

export const FacebookEngagementBottom = z.object({
  adId: z.string(),
  campaignId: z.string(),
  clickPosition: z.enum(['top_left', 'bottom_right', 'center']),
  device: z.enum(['mobile', 'desktop']),
  browser: z.enum(['Chrome', 'Firefox', 'Safari']),
  purchaseAmount: z.string().nullable(),
});

export const FacebookEngagement = z.union([FacebookEngagementTop, FacebookEngagementBottom]);

export const FacebookEvent = z.object({
  eventId: z.string(),
  timestamp: z.string(),
  source: z.literal('facebook'),
  funnelStage: FunnelStage,
  eventType: FacebookEventType,
  data: z.object({
    user: FacebookUser,
    engagement: FacebookEngagement,
  }),
});

// TikTok event types and schemas
export const TiktokTopEventType = z.enum(['video.view', 'like', 'share', 'comment']);
export const TiktokBottomEventType = z.enum(['profile.visit', 'purchase', 'follow']);
export const TiktokEventType = z.union([TiktokTopEventType, TiktokBottomEventType]);

export const TiktokUser = z.object({
  userId: z.string(),
  username: z.string(),
  followers: z.number(),
});

export const TiktokEngagementTop = z.object({
  watchTime: z.number(),
  percentageWatched: z.number(),
  device: z.enum(['Android', 'iOS', 'Desktop']),
  country: z.string(),
  videoId: z.string(),
});

export const TiktokEngagementBottom = z.object({
  actionTime: z.string(),
  profileId: z.string().nullable(),
  purchasedItem: z.string().nullable(),
  purchaseAmount: z.string().nullable(),
});

export const TiktokEngagement = z.union([TiktokEngagementTop, TiktokEngagementBottom]);

export const TiktokEvent = z.object({
  eventId: z.string(),
  timestamp: z.string(),
  source: z.literal('tiktok'),
  funnelStage: FunnelStage,
  eventType: TiktokEventType,
  data: z.object({
    user: TiktokUser,
    engagement: TiktokEngagement,
  }),
});

// Combined schemas
export const EventSchema = z.union([FacebookEvent, TiktokEvent]);
export type EventDto = z.infer<typeof EventSchema>;
export const EventsSchema = z.union([EventSchema, z.array(EventSchema)]);
