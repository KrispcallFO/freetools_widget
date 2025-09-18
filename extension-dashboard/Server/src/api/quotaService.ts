// services/QuotaService.ts (token version)
import { Repository } from "./repository";

export class QuotaService {
  async acquireTicket(installToken: string) {
    const remaining = await Repository.tryConsumeOne(installToken);
    if (remaining === null) {
      const err: any = new Error('Free TTS quota exhausted for this install.');
      err.status = 429;
      throw err;
    }
    let refunded = false;
    return {
      remaining,
      async refund() {
        if (refunded) return;
        refunded = true;
        await Repository.refundOne(installToken);
      },
    };
  }
}
