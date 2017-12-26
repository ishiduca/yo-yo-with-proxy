# yo-yo-with-proxy

### example

js```
var yo = require('./html')
var voodoo = require('./voodoo')

var app = voodoo({
  count: 0
}, function (proxyTarget, updateData) {
  return new Proxy(proxyTarget, {
    get (target, prop) {
      return target[prop]
    },
    set (obj, prop, value) {
      obj[prop] = value
      updateData()
    }
  })
}, {
  location: false
})

app.use(function (emitter, proxy) {
  emitter.on('increment', function (e) {
    proxy.count = proxy.count + 1
  })
  emitter.on('decrement', function (e) {
    proxy.count = proxy.count - 1
  })
})

app.route('/', function (proxy, params, uri, actionsUp) {
  return yo`
    <div>
      <h1>${proxy.count}</h1>
      <button onclick=${e => actionsUp('increment', e)}>increment</button>
      <button onclick=${e => actionsUp('decrement', e)}>decrement</button>
    </div>
  `
})

document.body.appendChild(app('/'))
```

## api

### app = voodoo(defaultData, createProxyFunction, option)

- `defaultData` objects which the proxy virtualizes. pass to `createProxyFunction`.
- `createProxyFunction(targetObject, updateData)` this function takes 2 argumetns. return `Proxy Object`
  - `targetObject` proxy target object. pass to Proxy constructor.
  - `updateData` __function__. when __updateData()__, DOM tree is updated.
- `option` 
  - `option.location` whether to manage the window.location. if window.history.pushState is available it will use that otherwise it will use `window.location.hash.
    - set to __false__ to disable
    - __hash__ to force using hashes
    - __history__ to force using __pushState__

### app.use(apiFunction, opt)

- `apiFunction(emitter, proxy, opt)`
  - `emitter` event emitter.
  - `proxy` proxy object using application.
- `opt` passed to `apiFunction`

### app.route(selector, handler)

= `selector`
- `handler`

### HTMLElement = app(route)
