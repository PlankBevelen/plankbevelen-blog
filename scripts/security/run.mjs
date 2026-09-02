// 安全自测脚本（Node 18+ 内置 fetch）
// 用法：先另开终端 `SECURITY_TEST_HOOK=1 pnpm dev`，再 `SECURITY_TEST_HOOK=1 pnpm security:test`
// 可设 SECURITY_TEST_BASE_URL 覆盖目标地址（默认 http://127.0.0.1:3000）

const BASE = process.env.SECURITY_TEST_BASE_URL || 'http://127.0.0.1:3000'

const results = []

function record(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  —  ${detail}` : ''}`)
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options)
  let body = null
  try {
    body = await res.json()
  } catch {
    // 非 JSON 响应
  }
  return { status: res.status, headers: res.headers, body }
}

const jsonHeaders = { 'content-type': 'application/json' }

async function main() {
  // —— CSRF ——
  {
    const { status } = await request('/api/tag', { method: 'POST', headers: jsonHeaders, body: '{}' })
    record('CSRF-1 无 Origin 写请求被拒(403)', status === 403, `got ${status}`)
  }
  {
    const { status } = await request('/api/tag', { method: 'POST', headers: { ...jsonHeaders, origin: BASE }, body: '{}' })
    record('CSRF-2 有 Origin 无 CSRF token 被拒(403)', status === 403, `got ${status}`)
  }
  {
    const { status } = await request('/api/tag', { method: 'GET' })
    record('CSRF-3 公开读不触发 CSRF(200)', status === 200, `got ${status}`)
  }

  // —— 验证码 ——
  {
    const { status, body } = await request('/api/admin/captcha')
    record('CAPTCHA-1 验证码可获取', status === 200 && !!body?.captchaId && !!body?.image, `status ${status}`)
  }
  {
    const { status } = await request('/api/admin/login', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ account: 'test@example.com', password: 'x' }),
    })
    record('CAPTCHA-2 无验证码登录被拒(400)', status === 400, `got ${status}`)
  }

  // —— 注入 / 路径 ——
  {
    const { status } = await request('/uploads/%2e%2e/%2e%2e/etc/passwd')
    record('INJ-1 上传路径穿越被拒(403/404)', status === 403 || status === 404, `got ${status}`)
  }
  {
    const { status } = await request('/uploads/x.svg')
    record('INJ-2 svg 读取被拒(403)', status === 403, `got ${status}`)
  }

  // —— 滥用 / limit ——
  {
    const { status, body } = await request('/api/article?limit=99999')
    record('ABUSE-1 limit 被 clamp 到 ≤50', status === 200 && Number(body?.limit) <= 50, `limit=${body?.limit}`)
  }

  // —— 安全头 ——
  {
    const { headers } = await request('/')
    const nosniff = headers.get('x-content-type-options') === 'nosniff'
    const frame = headers.get('x-frame-options') === 'DENY'
    const referrer = headers.get('referrer-policy') === 'strict-origin-when-cross-origin'
    record('HEADERS-1 安全头齐全', nosniff && frame && referrer, `nosniff=${nosniff} frame=${frame} referrer=${referrer}`)
  }

  // —— sitemap ——
  {
    const { status, body } = await request('/api/sitemap-urls')
    const hasArticles = Array.isArray(body) && body.some((u) => String(u?.loc).includes('/article'))
    record('SITEMAP-1 sitemap 含 /article', status === 200 && hasArticles, `got ${status}`)
  }

  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('security:test 执行失败:', error)
  process.exit(1)
})
