import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { VerifyRequest, VerifyResponse, SettleRequest, SettleResponse } from './types';
import { PaymentValidator } from './services/PaymentValidator';
import { KudoService } from './services/KudoService';

const app = new Hono();
const paymentValidator = new PaymentValidator();
const kudoService = new KudoService(
  process.env.RPC_URL || '',
  process.env.PRIVATE_KEY || '',
  process.env.CONTRACT_ADDRESS || ''
);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.get('/', (c) => {
  console.log('[GET /] Request received');
  return c.text('Hello Hono!');
});

app.post('/verify', async (c) => {
  console.log('[POST /verify] Request received');
  const body = await c.req.json<VerifyRequest>();
  console.log('[POST /verify] Request body:', JSON.stringify(body, null, 2));

  const response = paymentValidator.validate(body.paymentRequirements);
  console.log('[POST /verify] Validation response:', response);

  return c.json(response);
});

app.post('/settle', async (c) => {
  console.log('[POST /settle] Request received');
  const body = await c.req.json<SettleRequest>();
  console.log('[POST /settle] Request body:', JSON.stringify(body, null, 2));

  const kudoPaymentParams = body.paymentRequirements.extra.kudoPaymentParams;
  console.log('[POST /settle] Kudo payment params:', kudoPaymentParams);
  const response = await kudoService.mintOnBehalfOf(kudoPaymentParams);
  console.log('[POST /settle] Settlement response:', response);

  return c.json(response);
});

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Server is running on port ${PORT}`);

export default app;
