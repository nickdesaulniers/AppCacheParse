/* This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at http://mozilla.org/MPL/2.0/. */

// Adapted from FireFox:
// http://mxr.mozilla.org/mozilla-central/source/dom/apps/src/OfflineCacheInstaller.jsm

function parseAppCache(app, path, content) {
  let lines = content.split(/\r?\n/);

  let urls = [];
  let namespaces = [];
  let fallbacks = [];

  let currentSection = 'CACHE';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Ignore comments
    if (/^#/.test(line) || !line.length)
      continue;

    // Process section headers
    if (line == 'CACHE MANIFEST')
      continue;
    if (line == 'CACHE:') {
      currentSection = 'CACHE';
      continue;
    } else if (line == 'NETWORK:') {
      currentSection = 'NETWORK';
      continue;
    } else if (line == 'FALLBACK:') {
      currentSection = 'FALLBACK';
      continue;
    }

    // Process cache, network and fallback rules
    try {
      if (currentSection == 'CACHE') {
        parseCacheLine(app, urls, line);
      } else if (currentSection == 'NETWORK') {
        parseNetworkLine(namespaces, line);
      } else if (currentSection == 'FALLBACK') {
        parseFallbackLine(app, namespaces, fallbacks, line);
      }
    } catch(e) {
      throw new Error('Invalid ' + currentSection + ' line in appcache ' +
                      'manifest:\n' + e.message +
                      '\nFrom: ' + path +
                      '\nLine ' + i + ': ' + line);
    }
  }

  return {
    urls: urls,
    namespaces: namespaces,
    fallbacks: fallbacks
  };
}
