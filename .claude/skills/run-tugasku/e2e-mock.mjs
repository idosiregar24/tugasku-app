import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const BASE = 'http://localhost:5173'
const REF = 'geqchyvxasdbvxzpgauj'
const SUPA = `https://${REF}.supabase.co`
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })

const userId = '11111111-2222-3333-4444-555555555555'
const nowSec = Math.floor(Date.now() / 1000)
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: userId, email: 'ido@example.com', role: 'authenticated', aud: 'authenticated', exp: nowSec + 3600, iat: nowSec, session_id: 's1' })}.c2ln`
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'ido@example.com', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const session = { access_token: jwt, refresh_token: 'fake-refresh', expires_in: 3600, expires_at: nowSec + 3600, token_type: 'bearer', user }

const pad = (n) => String(n).padStart(2, '0')
const day = (offset) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const base = { user_id: userId, notes: '', task_type: 'task', is_recurring: false, completed_at: null }
let tasks = [
  { ...base, id: 't1', title: 'Makalah Sistem Informasi Manajemen', deadline: day(1), priority: 'High', status: 'todo', created_at: '2026-09-20T08:00:00Z', notes: 'Bab 1-3, minimal 10 halaman' },
  { ...base, id: 't2', title: 'Kuis Basis Data (online)', deadline: day(0), priority: 'Medium', status: 'todo', created_at: '2026-09-19T08:00:00Z' },
  { ...base, id: 't3', title: 'Revisi proposal PKL', deadline: day(-1), priority: 'High', status: 'todo', created_at: '2026-09-18T08:00:00Z' },
  { ...base, id: 't4', title: 'Baca jurnal untuk review', deadline: day(5), priority: 'Low', status: 'todo', created_at: '2026-09-17T08:00:00Z', is_recurring: true, recurrence_period: 'weekly' },
  { ...base, id: 't5', title: 'Laporan praktikum Jaringan', deadline: day(2), priority: 'Medium', status: 'finished', created_at: '2026-09-16T08:00:00Z', completed_at: '2026-09-21T08:00:00Z' },
  { ...base, id: 't6', title: 'Tugas UI/UX wireframe', deadline: day(0), priority: 'Low', status: 'done', created_at: '2026-09-15T08:00:00Z', completed_at: new Date().toISOString() },
  { ...base, id: 't7', title: 'Presentasi kelompok', deadline: day(0), priority: 'Medium', status: 'done', created_at: '2026-09-14T08:00:00Z', completed_at: new Date().toISOString() },
  { ...base, id: 's1', title: 'Kuliah Pemrograman Web', deadline: day(0), priority: 'Medium', status: 'todo', created_at: '2026-09-14T08:00:00Z', task_type: 'schedule', start_time: '08:00', end_time: '10:30' },
  { ...base, id: 's2', title: 'Belajar kelompok', deadline: day(0), priority: 'High', status: 'todo', created_at: '2026-09-14T08:00:00Z', task_type: 'schedule', start_time: '19:00', end_time: '21:00' },
]

const log = []
const consoleErrors = []
const assistantBodies = []
const patches = []

async function setup(context, { theme = 'light', auth = true } = {}) {
  await context.addInitScript(([key, value, theme, auth]) => {
    if (auth) localStorage.setItem(key, value)
    localStorage.setItem('tugasku-theme', theme)
  }, [`sb-${REF}-auth-token`, JSON.stringify(session), theme, auth])

  await context.route(`${SUPA}/**`, async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const method = req.method()
    const wantsObject = (req.headers()['accept'] || '').includes('vnd.pgrst.object')
    const reply = (rows) => route.fulfill({ json: wantsObject ? rows[0] ?? null : rows })

    if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ json: user })
    if (url.pathname.startsWith('/auth/v1/')) return route.fulfill({ json: {} })
    if (url.pathname === '/rest/v1/profiles') {
      return reply([{ id: userId, plan: 'free', full_name: 'Ido Refael', email: user.email, is_admin: false, created_at: '2026-01-01T00:00:00Z' }])
    }
    if (url.pathname === '/rest/v1/tasks') {
      if (method === 'GET') return reply(tasks)
      if (method === 'POST') {
        const body = JSON.parse(req.postData())
        const row = Array.isArray(body) ? body[0] : body
        const created = { ...base, id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row }
        tasks = [created, ...tasks]
        log.push(`POST task: ${row.title} (${row.task_type}, ${row.deadline}, ${row.priority})`)
        return reply([created])
      }
      if (method === 'PATCH') {
        const id = (url.searchParams.get('id') || '').replace('eq.', '')
        const changes = JSON.parse(req.postData())
        patches.push({ id, changes })
        tasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))
        return reply(tasks.filter((t) => t.id === id))
      }
      if (method === 'DELETE') {
        const id = (url.searchParams.get('id') || '').replace('eq.', '')
        tasks = tasks.filter((t) => t.id !== id)
        return route.fulfill({ status: 204, body: '' })
      }
    }
    return reply([])
  })

  let call = 0
  await context.route(`${BASE}/api/assistant`, async (route) => {
    const body = JSON.parse(route.request().postData())
    assistantBodies.push({ auth: route.request().headers()['authorization'], body })
    call += 1
    const lines = []
    if (call === 1) {
      lines.push({ type: 'text', text: 'Siap, aku tambahkan ' })
      lines.push({ type: 'text', text: 'tugasnya sekarang.' })
      lines.push({ type: 'tool', name: 'create_task' })
      lines.push({
        type: 'message',
        message: {
          steps: [
            { type: 'thought', signature: 'SIG-abc' },
            { type: 'model_output', content: [{ type: 'text', text: 'Siap, aku tambahkan tugasnya sekarang.' }] },
            { type: 'function_call', id: 'call_1', name: 'create_task', arguments: { title: 'Laporan praktikum fisika', deadline: day(3), priority: 'High' } },
          ],
        },
      })
    } else {
      lines.push({ type: 'text', text: 'Sudah kutambahkan **Laporan praktikum fisika** dengan prioritas tinggi.\n\nSaran urutan kerja:\n- Selesaikan **Revisi proposal PKL** dulu (sudah terlambat)\n- Lalu kuis Basis Data hari ini\n- Makalah SIM besok' })
      lines.push({ type: 'message', message: { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Sudah kutambahkan...' }] }] } })
    }
    await new Promise((r) => setTimeout(r, 400))
    return route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: lines.map((l) => JSON.stringify(l)).join('\n') + '\n' })
  })
}

const shot = async (page, name) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })
  log.push(`shot ${name}`)
}

const browser = await chromium.launch({ channel: 'msedge' })

// ─── iPhone-sized run ───
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  })
  await setup(context)
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`[mobile] ${m.text()}`))
  page.on('pageerror', (e) => consoleErrors.push(`[mobile pageerror] ${e.message}`))

  await page.goto(`${BASE}/dashboard`)
  await page.getByText('Halo,').waitFor()
  await shot(page, 'm01-dashboard')

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  log.push(`horizontal overflow on mobile: ${hasOverflow}`)

  await page.locator('main').evaluate((el) => el.scrollTo(0, 520))
  await shot(page, 'm02-board')

  await page.getByRole('button', { name: 'Tandai sudah dikerjakan' }).first().tap()
  await page.waitForTimeout(300)
  log.push(`status PATCH: ${JSON.stringify(patches.at(-1))}`)

  await page.getByRole('tab', { name: /Belum Submit/ }).tap()
  await shot(page, 'm03-tab-finished')
  await page.getByRole('tab', { name: /Dikerjakan/ }).tap()

  await page.getByRole('button', { name: 'Lainnya' }).tap()
  await shot(page, 'm04-more-sheet')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Tambah tugas' }).tap()
  await shot(page, 'm05-new-task-sheet')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Asisten', exact: true }).tap()
  await shot(page, 'm06-assistant-empty')
  await page.getByRole('button', { name: /Tambah tugas: laporan praktikum/ }).tap()
  await page.getByText('Saran urutan kerja').waitFor({ timeout: 10000 })
  await shot(page, 'm07-assistant-chat')
  await page.getByRole('button', { name: 'Tutup asisten' }).tap()

  await page.getByRole('button', { name: 'Lainnya' }).tap()
  await page.getByRole('button', { name: /Focus Timer/ }).tap()
  await shot(page, 'm08-timer')
  await page.getByRole('button', { name: 'Mulai' }).tap()
  await page.getByRole('button', { name: 'Tutup timer' }).tap()
  await shot(page, 'm09-timer-pill')

  await page.getByRole('button', { name: 'Jadwal' }).tap()
  await shot(page, 'm10-schedule')

  await page.getByRole('button', { name: 'Lainnya' }).tap()
  await page.getByRole('button', { name: /Insights/ }).tap()
  await shot(page, 'm11-insights')
  await page.locator('main').evaluate((el) => el.scrollTo(0, 420))
  await shot(page, 'm12-insights-chart')

  await page.getByRole('button', { name: 'Lainnya' }).tap()
  await page.getByRole('button', { name: /Mode Malam/ }).tap()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Workspace' }).tap()
  await page.locator('main').evaluate((el) => el.scrollTo(0, 0))
  await shot(page, 'm13-night-mode')
  await page.locator('main').evaluate((el) => el.scrollTo(0, 560))
  await shot(page, 'm13b-night-board')

  // Home-screen shortcut deep link
  await page.goto(`${BASE}/dashboard?action=new-task`)
  await page.getByText('Langkah 1').waitFor()
  log.push(`deep link url after load: ${page.url()}`)
  await shot(page, 'm14-deeplink-new-task')

  await context.close()
}

// ─── Login page, logged out, mobile ───
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await setup(context, { auth: false })
  const page = await context.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`[login pageerror] ${e.message}`))
  await page.goto(`${BASE}/login`)
  await page.waitForLoadState('networkidle')
  await shot(page, 'm15-login')
  await page.goto(`${BASE}/`)
  await page.waitForLoadState('networkidle')
  await shot(page, 'm16-landing')
  await page.evaluate(() => window.scrollTo(0, 900))
  await shot(page, 'm17-landing-preview')
  const landingOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  log.push(`landing horizontal overflow on mobile: ${landingOverflow}`)
  await context.close()
}

// ─── Public pages, desktop ───
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await setup(context, { auth: false })
  const page = await context.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`[landing pageerror] ${e.message}`))
  await page.goto(`${BASE}/`)
  await page.waitForLoadState('networkidle')
  await shot(page, 'd05-landing')
  await page.evaluate(() => window.scrollTo(0, 700))
  await shot(page, 'd06-landing-preview')
  await page.goto(`${BASE}/pricing`)
  await page.waitForLoadState('networkidle')
  await shot(page, 'd07-pricing')
  await context.close()
}

// ─── Desktop, night theme ───
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await setup(context, { theme: 'dark' })
  const page = await context.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`[desktop-night pageerror] ${e.message}`))
  await page.goto(`${BASE}/dashboard`)
  await page.getByText('Halo,').waitFor()
  await shot(page, 'd08-night-dashboard')
  await context.close()
}

// ─── Desktop run ───
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await setup(context)
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`[desktop] ${m.text()}`))
  page.on('pageerror', (e) => consoleErrors.push(`[desktop pageerror] ${e.message}`))
  await page.goto(`${BASE}/dashboard`)
  await page.getByText('Halo,').waitFor()
  await shot(page, 'd01-dashboard')
  await page.locator('main').evaluate((el) => el.scrollTo(0, 600))
  await shot(page, 'd02-board')
  await page.getByRole('button', { name: 'Asisten AI' }).last().click()
  await shot(page, 'd03-assistant')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Insights' }).click()
  await shot(page, 'd04-insights')
  await context.close()
}

await browser.close()

const firstCall = assistantBodies[0]
const secondCall = assistantBodies[1]
log.push(`assistant calls: ${assistantBodies.length}`)
if (firstCall) {
  log.push(`call1 auth header: ${firstCall.auth?.slice(0, 20)}…`)
  log.push(`call1 context: today=${firstCall.body.context.today} tz=${firstCall.body.context.timeZone} tasks=${firstCall.body.context.tasks.length} user=${firstCall.body.context.userName}`)
  log.push(`call1 input: ${JSON.stringify(firstCall.body.input)}`)
}
if (secondCall) {
  const items = secondCall.body.input
  log.push(`call2 input item types: ${items.map((i) => i.type).join(',')}`)
  log.push(`call2 function_result: ${JSON.stringify(items.at(-1))}`)
}
console.log(log.join('\n'))
console.log('\nCONSOLE ERRORS:\n' + (consoleErrors.join('\n') || '(none)'))
