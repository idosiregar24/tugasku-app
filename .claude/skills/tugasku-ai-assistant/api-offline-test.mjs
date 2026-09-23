// Drives api/assistant.js with a fake fetch for Supabase; Gemini is faked too
// unless GEMINI_LIVE=1, in which case the real API is called with GEMINI_API_KEY
// (useful to check whether a key actually works).
//
//   node .claude/skills/tugasku-ai-assistant/api-offline-test.mjs api/assistant.js
//   GEMINI_LIVE=1 node .claude/skills/tugasku-ai-assistant/api-offline-test.mjs api/assistant.js
import { pathToFileURL } from 'node:url'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'

const LIVE = process.env.GEMINI_LIVE === '1'

// Load .env (the dev server does this via Vite's loadEnv; this script is standalone)
for (const line of fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').split('\n') : []) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
if (!LIVE) process.env.GEMINI_API_KEY = 'AIza-test-key'
process.env.VITE_SUPABASE_URL ||= 'https://example.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY ||= 'anon'

let geminiRequest = null
const sse = (events) => events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('')

const realFetch = globalThis.fetch
globalThis.fetch = async (input, init = {}) => {
  // The SDK calls fetch(Request); Supabase calls fetch(url, init)
  const isRequest = typeof input === 'object' && typeof input.url === 'string'
  const url = isRequest ? input.url : String(input)
  const headers = isRequest ? input.headers : new Headers(init.headers)
  const readBody = async () => (isRequest ? await input.clone().text() : init.body)

  if (url.includes('/auth/v1/user')) {
    const auth = new Headers(headers).get('authorization')
    if (auth !== 'Bearer good-token') {
      return new Response(JSON.stringify({ msg: 'bad jwt' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({ id: 'u1', aud: 'authenticated', email: 'a@b.c' }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  if (url.includes('generativelanguage.googleapis.com') || url.includes('/interactions')) {
    geminiRequest = { url, headers: Object.fromEntries(new Headers(headers)), body: JSON.parse((await readBody()) || '{}') }
    if (LIVE) return realFetch(input, init)
    // Mirrors a real stream: a signed thought step, chunked tool arguments,
    // and a completed event that carries NO steps (they must be rebuilt).
    const body = sse([
      { event_type: 'interaction.created', interaction: { id: 'i_1', status: 'in_progress', model: 'gemini-3.8-flash' } },
      { event_type: 'step.start', index: 0, step: { type: 'thought' } },
      { event_type: 'step.delta', index: 0, delta: { type: 'thought_signature', signature: 'SIG-abc' } },
      { event_type: 'step.stop', index: 0 },
      { event_type: 'step.start', index: 1, step: { type: 'model_output' } },
      { event_type: 'step.delta', index: 1, delta: { type: 'text', text: 'Oke, ' } },
      { event_type: 'step.delta', index: 1, delta: { type: 'text', text: 'kubuat.' } },
      { event_type: 'step.stop', index: 1 },
      { event_type: 'step.start', index: 2, step: { type: 'function_call', id: 'fc_1', name: 'create_task', arguments: {} } },
      { event_type: 'step.delta', index: 2, delta: { type: 'arguments_delta', arguments: '{"title":"Tes","dead' } },
      { event_type: 'step.delta', index: 2, delta: { type: 'arguments_delta', arguments: 'line":"2026-09-25","priority":"High"}' } },
      { event_type: 'step.stop', index: 2 },
      { event_type: 'interaction.completed', interaction: { id: 'i_1', status: 'requires_action', usage: { total_tokens: 42 } } },
    ])
    return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
  }
  throw new Error(`unexpected fetch ${url}`)
}

const { default: handler } = await import(pathToFileURL(process.argv[2]).href)

function fakeReqRes({ method = 'POST', token, body }) {
  const req = Object.assign(new EventEmitter(), { method, headers: token ? { authorization: `Bearer ${token}` } : {}, body })
  const res = Object.assign(new EventEmitter(), {
    statusCode: 200,
    headers: {},
    chunks: [],
    writableEnded: false,
    writableFinished: false,
    destroyed: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v },
    write(c) { this.chunks.push(String(c)); return true },
    end(c) { if (c) this.chunks.push(String(c)); this.writableEnded = this.writableFinished = true; this.emit('close') },
  })
  return { req, res }
}

const run = async (opts) => {
  const { req, res } = fakeReqRes(opts)
  await handler(req, res)
  return { status: res.statusCode, type: res.headers['content-type'], out: res.chunks.join('') }
}

const goodBody = {
  input: [{ type: 'user_input', content: [{ type: 'text', text: 'Tambah tugas Tes deadline 25 Sep' }] }],
  context: {
    today: '2026-09-23', todayLabel: 'Rabu, 23 September 2026', timeZone: 'Asia/Jakarta',
    userName: 'Ido', isPro: false, taskLimit: 15,
    tasks: [{ id: 't1', title: 'Makalah', status: 'todo', priority: 'High', deadline: '2026-09-24', task_type: 'task', notes: 'x'.repeat(500) }],
  },
}

console.log('mode          ->', LIVE ? 'LIVE (memanggil Gemini sungguhan)' : 'mock')
console.log('no token      ->', (await run({ body: goodBody })).status)
console.log('bad token     ->', (await run({ token: 'nope', body: goodBody })).status)
console.log('bad order     ->', JSON.stringify(await run({ token: 'good-token', body: { input: [{ type: 'function_call' }] } })))
const ok = await run({ token: 'good-token', body: goodBody })
console.log('stream status ->', ok.status, ok.type)
console.log('NDJSON lines  ->')
for (const line of ok.out.trim().split('\n')) console.log('   ', line.slice(0, 300))

const r = geminiRequest
if (r) {
  console.log('\nupstream url  ->', r.url)
  console.log('api key hdr   ->', Object.keys(r.headers).filter((h) => /key|authorization/i.test(h)).join(', ') || '(none)')
  console.log('model/stream  ->', r.body.model, '| stream=', r.body.stream, '| store=', r.body.store)
  console.log('generation    ->', JSON.stringify(r.body.generation_config))
  console.log('tools         ->', (r.body.tools || []).map((t) => `${t.type}:${t.name}`).join(', '))
  console.log('input items   ->', (r.body.input || []).map((i) => i.type).join(', '))
  console.log('system head   ->', String(r.body.system_instruction).slice(0, 80).replace(/\n/g, ' ') + '…')
  console.log('context tail  ->', String(r.body.system_instruction).split('Daftar (JSON):')[1]?.slice(0, 140))
}
