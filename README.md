# s

Create share links for OctopusGarage GitHub Pages destinations. The destination is encoded in an AES-GCM token in the URL fragment. The browser decrypts it and opens the destination. Each token carries its own destination.

The key is public and intentionally stable. Anyone with a valid share link can read its destination or mint a token. Keep existing token versions readable when updating the format.

## Run locally

Serve this directory over localhost, for example with `python3 -m http.server 8080`. Open `http://localhost:8080/` to generate a link. The generated URL uses the production address. To test it locally, paste its fragment after the localhost URL.

Run tests with Node.js 22 or newer using `node --test tests/*.test.mjs`.

## Publish

Put these files at the root of the `OctopusGarage/s` repository and configure GitHub Pages to publish from the default branch's root. The expected address is `https://octopusgarage.github.io/s/`.
