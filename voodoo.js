var url = require('url')
var d = require('global/document')
var w = require('global/window')
var yo = require('yo-yo')
var xtend = require('xtend')
var ready = require('document-ready')
var nsEmitter = require('namespace-emitter')
var routington = require('routington')
var href = require('nanohref')

var VOODOO = require('./package').name
var MOUNT_ROUTE = `${VOODOO}:mountRoute`
var LINK_ROUTE = `${VOODOO}:link`
var UPDATE_DATA = `${VOODOO}:updateData`
var PRE_UPDATE = `${VOODOO}:preUpdate`
var UPDATE = `${VOODOO}:update`

module.exports = voodoo
module.exports.notFound = notFound

function voodoo (defaultData, handlers, _opt) {
  var opt = xtend(_opt)
  var proxy = handlers(defaultData, updateData)
  var emitter = nsEmitter()
  var router = routington()
  var el
  var render

  function app (u) {
    mountRoute(u)
    el = render()
    return yo`<section id="${VOODOO}-app-root">${el}</section>`
  }

  app.route = registerRoute
  app.use = registerApi

  emitter.on(LINK_ROUTE, function (link) {
    mountRoute(cURL(link))
  })
  ready(function () {
    emitter.emit('DOMContentLoaded')
  })

  if (opt.location !== false) init(opt.location)

  return app

  function updateData () {
    emitter.emit(UPDATE_DATA, proxy)
    update()
  }

  function update () {
    var newEl = render()
    emitter.emit(PRE_UPDATE, el, newEl)
    el = yo.update(el, newEl)
    emitter.emit(UPDATE)
  }

  function registerApi (api, opt) {
    api(emitter, proxy, opt)
  }

  function registerRoute (pattern, model) {
    var node = router.define(pattern)[0]
    node.model = model
  }

  function mountRoute (uri) {
    var u = url.parse(uri, true)
    var m = router.match(u.pathname)
    if (m == null) {
      render = function renderOnNotFound () {
        return module.exports.notFound(proxy, u.query, uri, actionsUp)
      }
    } else {
      render = function () {
        return m.node.model(proxy, xtend(u.query, m.param), uri, actionsUp)
      }
    }

    emitter.emit(MOUNT_ROUTE, uri)
  }

  function actionsUp () {
    emitter.emit.apply(emitter, arguments)
  }

  function init (which) {
    if (!d.location) return

    var preventOnMount = false
    var usePush = !!(w && w.history && w.history.pushState)

    if (usePush) {
      w.onpopstate = function onPopState (e) {
        preventOnMount = true
        mountRoute(cURL(d.location.href))
        update()
      }
      emitter.on(MOUNT_ROUTE, function (u) {
        if (!preventOnMount) w.history.pushState({}, u, u)
        preventOnMount = false
      })
    } else {
      w.addEventListener('hashchange', function onHashChange (e) {
        preventOnMount = true
        mountRoute(cURL(d.location.hash.slice(1)))
        update()
      })
      emitter.on(MOUNT_ROUTE, function (u) {
        if (!preventOnMount) d.location.href = (u.slice(0, 1) === '#') ? u : `#${u}`
        preventOnMount = false
      })
    }

    href(function (node) {
      mountRoute(cURL(node.href))
      update()
    })
  }

  function cURL (uri) {
    var u = url.parse(uri)
    var h = u.pathname
    if (u.query) h += u.query.slice(0, 1) === '?' ? u.query : `?{u.query}`
    if (u.hash) h += u.hash
    return h
  }
}

function notFound (proxy, params, uri, actionsUp) {
  return yo`
    <div>
      <h1>404 not found</h1>
      <p>not found "${uri}"</p>
    </div>
  `
}
