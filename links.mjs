const origin = 'https://octopusgarage.github.io';
const version = 1;
const ivSize = 12;
const tagSize = 16;
const maxPayloadSize = 2048;
const maxTokenSize = Math.ceil((1 + ivSize + tagSize + maxPayloadSize) * 4 / 3);
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

// Public compatibility key. Keep it stable so existing links continue to open.
const publicKey = '31f0bd8c86055c5da2c6f20639112498b47f40d7b7165aa7d3df74493bad17d4';
const getKey = () => crypto.subtle.importKey(
  'raw', Uint8Array.from(publicKey.match(/../g), byte => Number.parseInt(byte, 16)),
  'AES-GCM', false, ['encrypt', 'decrypt'],
);

function destination(input) {
  const url = new URL(input);
  const path = decodeURIComponent(url.pathname);
  const canonical = new URL(path.replaceAll('\\', '/'), origin);
  if (url.origin !== origin || url.username || url.password ||
      canonical.origin !== origin || /^\/s(?:\/|$)/i.test(canonical.pathname)) {
    throw new Error('Enter an OctopusGarage GitHub Pages URL outside /s/.');
  }
  return url;
}

function encodeToken(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export async function encryptLink(input) {
  const url = destination(input);
  const payload = encoder.encode(url.href.slice(origin.length));
  if (payload.length > maxPayloadSize) throw new Error('The destination URL is too long.');

  const iv = crypto.getRandomValues(new Uint8Array(ivSize));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, await getKey(), payload,
  ));
  const bytes = new Uint8Array(1 + ivSize + ciphertext.length);
  bytes[0] = version;
  bytes.set(iv, 1);
  bytes.set(ciphertext, 1 + ivSize);
  return encodeToken(bytes);
}

export async function decryptLink(token) {
  if (token.length > maxTokenSize || !/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Invalid share link.');
  }
  const bytes = Uint8Array.from(atob(token.replaceAll('-', '+').replaceAll('_', '/')),
    char => char.charCodeAt(0));
  if (bytes.length <= 1 + ivSize + tagSize || bytes[0] !== version ||
      encodeToken(bytes) !== token) {
    throw new Error('Invalid share link.');
  }

  const payload = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.subarray(1, 1 + ivSize) },
    await getKey(), bytes.subarray(1 + ivSize),
  );
  const relative = decoder.decode(payload);
  if (!relative.startsWith('/')) throw new Error('Invalid destination.');
  return destination(new URL(relative, origin)).href;
}
