var appCacheParse = require('./appCacheParse').appCacheParse;

var parseResults = appCacheParse.parse({ origin: 'http://firefox.org/' },
  'made up path',
  "CACHE MANIFEST\n# v1 2011-08-14\n# This is another comment\n/index.html\n/cache.html\n/style.css\n/image1.png\n\n# Use from network if available\nNETWORK:\nnetwork.html\n\n# Fallback content\nFALLBACK:\n/ fallback.html"
);

console.log(parseResults);