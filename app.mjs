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

const handoffTitle = document.getElementById('handoff-title');
const handoffError = document.getElementById('handoff-error');
const reset = document.getElementById('reset');
let navigation = 0;

async function openLink() {
  const request = ++navigation;
  const hash = location.hash;
  document.documentElement.dataset.mode = hash.length > 1 ? 'opening' : 'compose';
  handoffTitle.textContent = 'Opening your link';
  handoffError.hidden = true;
  reset.hidden = true;
  if (hash.length <= 1) return;

  try {
    const target = await decryptLink(hash.slice(1));
    if (request === navigation && location.hash === hash) location.replace(target);
  } catch {
    if (request !== navigation || location.hash !== hash) return;
    document.documentElement.dataset.mode = 'error';
    handoffTitle.textContent = 'This link could not be opened';
    handoffError.hidden = false;
    reset.hidden = false;
  }
}

addEventListener('hashchange', openLink);
void openLink();
