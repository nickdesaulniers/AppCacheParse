/* This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at http://mozilla.org/MPL/2.0/. */

// Adapted from FireFox:
// http://mxr.mozilla.org/mozilla-central/source/dom/apps/src/OfflineCacheInstaller.jsm
// which was written mostly by Alexandre Poirot - https://github.com/ochameau
// http://blog.techno-barje.fr/

(function () {
  // node or browser
  var root = null;
  if (typeof exports !== "undefined" && exports !== null) {
    root = exports;
  } else {
    root = this;
  }

  root.appCacheParse = {
  parseCacheLine: function parseCacheLine (app, urls, line) {
    // Prepend webapp origin in case of absolute path
    if (line[0] == '/') {
      urls.push(app.origin + line.substring(1));
    // Just pass along the url, if we have one
    } else if (line.substr(0, 4) == 'http') {
      urls.push(line);
    } else {
      throw new Error('Only accept absolute path and http/https URLs');
    }
  },
  parseNetworkLine: function parseNetworkLine (namespaces, line) {
    var type = 'NAMESPACE_BYPASS';
    if (line[0] == '*' && (line.length == 1 || line[1] == ' ' ||
      line[1] == '\t')) {
      namespaces.push([type, '', '']);
    } else {
      namespaces.push([type, 'namespace', '']);// ?
    }
  },
  parseFallbackLine: function parseFallbackLine (app, namespaces, fallbacks, line) {
    var split = line.split(/[ \t]+/),
        namespace = null,
        fallback = null,
        type = 'NAMESPACE_FALLBACK';// ?

    if (split.length != 2) {
      throw new Error('Should be made of two URLs seperated with spaces')
    }

    namespace = split[0];
    fallback = split[1];

    // Prepend webapp origin in case of absolute path
    if (namespace[0] == '/') {
      namespace = app.origin + namespace.substring(1);
    } 
    if (fallback[0] == '/') {
      fallback = app.origin + fallback.substring(1);
    }

    namespaces.push([type, namespace, fallback]);
    fallbacks.push(fallback);
  },
  // App just needs to be an object with attribute origin
  parse: function parse (app, path, content) {
    var lines = content.split(/\r?\n/),
        urls = [],
        namespaces = [],
        fallbacks = [],
        currentSection = 'CACHE',
        i = 0,
        len = lines.length,
        line = null,
        commentRE = /^#/;

    for (; i < len; i++) {
      line = lines[i];

      // Ignore comments
      if (!line.length || commentRE.test(line)) {
        continue;
      }

      // Process section headers
      switch (line) {
        case 'CACHE MANIFEST': continue;
        case 'CACHE:': currentSection = 'CACHE'; continue;
        case 'NETWORK:': currentSection = 'NETWORK'; continue;
        case 'FALLBACK:': currentSection = 'FALLBACK'; continue;
        default:
          // Process cache, network, and fallback rules
          try {
            switch (currentSection) {
              case 'CACHE': this.parseCacheLine(app, urls, line); break;
              case 'NETWORK': this.parseNetworkLine(namespaces, line); break;
              case 'FALLBACK':
                this.parseFallbackLine(app, namespaces, fallbacks, line); break;
            }
          } catch (e) {
            throw new Error('Invalid ' + currentSection + ' line in appcache ' +
              'manifest:\n' + e.message + '\nFrom: ' + path + '\nLine: ' + i +
              ':' + line);
          }
      }
    }
    return {
        urls: urls,
        namespaces: namespaces,
        fallbacks: fallbacks
      };
  }
};
})();