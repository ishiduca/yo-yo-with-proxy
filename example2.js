var yo = require('./html')
var voodoo = require('./voodoo')
var app = voodoo({time: 10, isTimersState: null}, proxies, {location: false})

app.use(timer)
app.route('/', main)

document.body.appendChild(app('/'))

function proxies (t, update) {
  return new Proxy(t, {
    get (target, prop) {
      if (prop === 'timersButton') {
        return target.time <= 0 ? 'ended' : target.isTimersState ? 'pause' : 'count down'
      }
      if (prop === 'isDisabled') {
        return !(target.time > 0)
      }
      return target[prop]
    },
    set (obj, prop, value) {
      obj[prop] = value
      update()
    }
  })
}

function timer (emitter, proxy) {
  emitter.on('toggle', e => {
    e.stopPropagation()

    if (!proxy.isTimersState) {
      proxy.isTimersState = setInterval(countdown, 1000)
      countdown()
    } else {
      pause()
    }

    function countdown () {
      if (proxy.time === 0) return end()
      if (proxy.time < 0) return end()
      proxy.time -= 1
    }

    function pause () {
      clearInterval(proxy.isTimersState)
      proxy.isTimersState = null
    }

    function end () {
      pause()
      proxy.time = 0
    }
  })
}

function main (proxy, p, u, actionsUp) {
  return yo`
    <div>
      <h1>${proxy.time}</h1>
      <button onclick=${e => actionsUp('toggle', e)} disabled=${proxy.isDisabled}>
        ${proxy.timersButton}
      </button>
    </div>
  `
}
