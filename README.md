# AppCacheParse #
Parse an App Cache in JavaScript for debugging

## Browser Usage ##
```html
<script src="js/appCacheParse.js"></script>
<script>
  var xhr = new XMLHttpRequest();
  var appCache = null;

  xhr.onreadystatechange = function readystatechange () {
    if (xhr.readystate === 4) {
      try {
        appCache = appCacheParse.parse(
          window.location,
          'path???',
          xhr.responseText
        );
      } catch {
        console.log('Error occurred');
      }
      console.log(appCache);
    }
  };

</script>
```

## Node.js Usage ##
```javascript
var appCacheParse = require('./appCacheParse').appCacheParse;

var parseResults = appCacheParse.parse({ origin: 'http://firefox.org/' },
  'made up path',
  "CACHE MANIFEST\n# v1 2011-08-14\n# This is another comment\n/index.html\n/cache.html\n/style.css\n/image1.png\n\n# Use from network if available\nNETWORK:\nnetwork.html\n\n# Fallback content\nFALLBACK:\n/ fallback.html"
);
```