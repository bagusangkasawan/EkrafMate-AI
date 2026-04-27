import axios from 'axios';

const verifyTurnstile = async (token, ip) => {
  const response = await axios.post(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
};

export default verifyTurnstile;
