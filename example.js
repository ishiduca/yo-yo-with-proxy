var yo = require('./html')
var voodoo = require('./voodoo')

var app = voodoo({
  count: 0
}, function (defaualtData, updateData) {
  return new Proxy(defaualtData, {
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
