import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptLink, encryptLink } from '../dist/sdk.mjs';
import { decryptLink as openPageToken } from '../links.mjs';

const recipe = 'https://octopusgarage.github.io/panfolio/#02.ajian-ban-dan-chao-fan';
const legacy = 'https://octopusgarage.github.io/s/#AYTfYczYd4YVMCgoiWUzRv5rJvGSrFLt_kHnXN2Y_XCvtQF_82vf6n2IY557BSXfa8_M0NRq56WvBfT20qB1o28';

test('SDK output works in the Pages resolver and existing links decode', async () => {
  const share = new URL(await encryptLink(recipe));
  assert.equal(await openPageToken(share.hash.slice(1)), recipe);
  assert.equal((await decryptLink(share)).href, recipe);
  assert.equal((await decryptLink(legacy)).href, recipe);
  await assert.rejects(decryptLink(legacy.replace('github.io', 'github.io.example')));
});
