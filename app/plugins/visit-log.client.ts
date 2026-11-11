export default defineNuxtPlugin(() => {
  const path = window.location.pathname + window.location.search
  if (path.startsWith('/admin')) return

  const body = JSON.stringify({ path })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/visit', new Blob([body], { type: 'application/json' }))
    return
  }

  void fetch('/api/visit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
})
