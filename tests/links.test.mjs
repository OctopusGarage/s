import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptLink, encryptLink } from '../links.mjs';

const target = 'https://octopusgarage.github.io/panfolio/?lang=zh#02.ajian-ban-dan-chao-fan';

test('round trips a destination with a query and fragment using unique tokens', async () => {
  const token = await encryptLink(target);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.notEqual(token, await encryptLink(target));
  assert.equal(await decryptLink(token), target);
});

test('rejects outside destinations and links back to the share app', async () => {
  for (const url of [
    'https://example.org/panfolio/',
    'https://octopusgarage.github.io.evil.example/panfolio/',
    'https://user@octopusgarage.github.io/panfolio/',
    'http://octopusgarage.github.io/panfolio/',
    'https://octopusgarage.github.io/s/#token',
    'https://octopusgarage.github.io/%73/#token',
  ]) await assert.rejects(encryptLink(url));
});

test('rejects malformed and modified tokens', async () => {
  const token = await encryptLink(target);
  const offset = 23;
  const changed = token.slice(0, offset) + (token[offset] === 'A' ? 'B' : 'A') + token.slice(offset + 1);
  await assert.rejects(decryptLink(changed));
  await assert.rejects(decryptLink('invalid!'));
});
