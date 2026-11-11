'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const match = typeof signature === 'string'
    ? signature.match(/^sha256=([a-f0-9]{64})$/i)
    : null;

  let valid = false;
  if (match && Buffer.isBuffer(req.body)) {
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(req.body)
      .digest();
    const received = Buffer.from(match[1], 'hex');
    valid = crypto.timingSafeEqual(expected, received);
  }

  if (!valid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body);

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  _processedIds.add(event.id);
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    handleEvent(event);
  });
}

module.exports = { handleWebhook, _processedIds };
