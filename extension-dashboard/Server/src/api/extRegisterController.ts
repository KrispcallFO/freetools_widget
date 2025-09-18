// extRegisterController.ts
import type { RequestHandler } from 'express';
import { Repository } from './repository';

export const registerInstall: RequestHandler = async (req, res, next) => {
  try {
    const { installId, email, profileId } = req.body ?? {};

    if (!installId) {
      res.status(400).json({ message: 'installId required' });
      return; // IMPORTANT: don't return the Response value
    }

    if (profileId) {
      const n = await Repository.countRecentRegistrationsByProfile(profileId, 24);
      if (n > 3) {
        res.status(429).json({ message: 'Too many installs for this profile in 24h.' });
        return; // IMPORTANT
      }
    }

    const { installToken, record } = await Repository.createOrGetToken({
      installId,
      userEmail: email?.toLowerCase() ?? null,
      profileId: profileId ?? null,
    });

    res.json({ installToken, quotaRemaining: record.quotaRemaining });
    // no return value (void)
  } catch (err) {
    next(err);
  }
};
