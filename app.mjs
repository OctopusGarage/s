import { decryptLink, encryptLink } from './links.mjs';

const form = document.getElementById('generator');
const input = document.getElementById('destination');
const result = document.getElementById('result');
const shared = document.getElementById('shared');
const status = document.getElementById('status');
const generate = document.getElementById('generate');

form.addEventListener('submit', async event => {
  event.preventDefault();
  generate.disabled = true;
  result.hidden = true;
  status.textContent = '';
  try {
    const url = new URL('https://octopusgarage.github.io/s/');
    url.hash = await encryptLink(input.value);
    shared.value = url.href;
    result.hidden = false;
    shared.focus();
    shared.select();
  } catch (error) {
    status.textContent = error instanceof TypeError
      ? 'Enter a valid OctopusGarage Pages URL.'
      : error.message;
  } finally {
    generate.disabled = false;
  }
});

document.getElementById('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shared.value);
    status.textContent = 'Copied.';
  } catch {
    shared.focus();
    shared.select();
    status.textContent = 'Copy the selected link.';
  }
});

async function openLink() {
  const hash = location.hash;
  const opening = hash.length > 1;
  form.hidden = opening;
  result.hidden = true;
  document.getElementById('note').hidden = opening;
  document.getElementById('reset').hidden = !opening;
  const title = document.getElementById('title');
  title.textContent = opening ? 'Opening your link' : 'Share a link';
  status.textContent = '';
  if (!opening) return;

  try {
    const target = await decryptLink(hash.slice(1));
    if (location.hash === hash) location.replace(target);
  } catch {
    if (location.hash !== hash) return;
    title.textContent = 'This link could not be opened';
    status.textContent = 'Check that you copied the full share link.';
  }
}

addEventListener('hashchange', openLink);
void openLink();
