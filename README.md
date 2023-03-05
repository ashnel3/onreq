# onreq
Simple request interception.

## Usage:
```javascript
import { createRequestListener } from 'onreq'

const listener = createRequestListener().on('fetch', (url, req) => {
  console.log(`Fetching: "${url}"!`)

  // Cancel requests going to 'example.com'
  return url.host !== 'example.com'
})

// listener.delete()
```
