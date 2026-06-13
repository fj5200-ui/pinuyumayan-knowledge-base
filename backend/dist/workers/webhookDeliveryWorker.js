"use strict";
/**
 * Placeholder worker for webhook_outbox_events.
 * Production implementation should:
 * 1. SELECT pending events with next_attempt_at <= NOW()
 * 2. Sign payload using HMAC-SHA256
 * 3. POST to webhook_subscriptions.target_url
 * 4. Mark delivered/failed/dead_letter with retry schedule
 */
console.log("webhookDeliveryWorker placeholder: implement DB-backed outbox delivery before enabling webhooks.");
