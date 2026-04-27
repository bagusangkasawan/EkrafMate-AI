import asyncHandler from 'express-async-handler';
import verifyTurnstile from '../utils/verifyTurnstile.js';

const turnstileProtect = asyncHandler(async (req, res, next) => {
  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    res.status(403);
    throw new Error('Verifikasi diperlukan');
  }

  const result = await verifyTurnstile(
    turnstileToken,
    req.ip
  );

  if (!result.success) {
    res.status(403);
    throw new Error('Verifikasi gagal');
  }

  next();
});

export default turnstileProtect;
