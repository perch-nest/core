# Perch Nest core

**What Perch and Roost share, kept in one place.** A fix here, above all a security fix, is made once and reaches
both projects exactly the same.

Everything in this repository was designed and written for **[Perch](https://github.com/Just-Rice/perch) by
[Just-Rice](https://github.com/Just-Rice)**, the original. [Roost](https://github.com/faarisaahmed/roost), the Windows
port, added Windows fixes and a few lines that let both projects share it.

| Path | What | Goes to, in each project |
|---|---|---|
| `protocol/` | The protocol both a website and a computer speak: sealed rendezvous over MQTT, channel binding, the crypto helpers, the relay protocol, constants. Plain ES modules for browsers and Node 22+. | `site/js/shared/` |
| `protocol/product.js` | **Not shared**: each project's website address and its own meeting points. Each project keeps its own. | (stays the project's) |
| `relay/src/index.js` | The Cloudflare Worker relay, for both projects (and Perch Nest): it answers as either project's relay and carries each one's topics only. | `relay/src/index.js` |
| `relay/node/server.mjs` | The same relay as a plain Node.js server, with its Cloudflare Quick Tunnel mode. | `relay/node/server.mjs` |
| `scripts/sync-core.mjs` | The tool that brings core into a project. | `scripts/sync-core.mjs` |

## How a project uses it

Each project keeps a copy of core's files, so its website, tests and releases work on their own, and two small files
saying which version:

- `core.json`: core's address, the version (a tag here), and where each file goes;
- `core.lock`: what was copied, with a fingerprint of each file.

```
node scripts/sync-core.mjs           # bring in the version core.json names (writes core.lock)
node scripts/sync-core.mjs --check   # CI: nothing from core has been edited in the project
```

**To change something shared:** change it here, run `npm test`, tag a release (`git tag v0.2.0`), then in each
project bump `ref` in `core.json`, run the sync and that project's own tests. A change made to core's files inside a
project fails that project's CI.

## Next: the host

The hosts (`host/` in Roost, `host/node/` in Perch: sign-in, the rendezvous, WebRTC, sessions, the Setup / Control
Center server) are about 86% the same and are next to move here. What differs is narrow, and becomes settings a
project passes in rather than copies of code:

- names and words (Perch / Roost, Mac / PC) and its environment variables' prefix;
- where secrets are kept (the macOS Keychain, Windows DPAPI through roost.exe, or a file in tests);
- the updater (Perch.app and `install.sh`, or roost.exe and `install.ps1`);
- the app's HELLO (macOS permissions, or Windows' elevation and features).

## Tests

```
(cd relay/node && npm ci) && npm test
```

## Licence

Apache 2.0, the same as Perch and Roost. See [NOTICE](NOTICE).
