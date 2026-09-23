import { useCallback, useEffect, useRef, useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'

const MAX_TOOL_ROUNDS = 6
const MAX_HISTORY_ITEMS = 100
const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['todo', 'finished', 'done']
const STATUS_LABEL = { todo: 'Perlu Dikerjakan', finished: 'Belum Submit', done: 'Selesai' }
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

class AssistantError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

let idCounter = 0
const uid = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && isValid(parseISO(s))
const cleanText = (s, max) => (typeof s === 'string' ? s.trim().slice(0, max) : '')
const shortDate = (s) => format(parseISO(s), 'd MMM', { locale: localeId })

/**
 * Chat state + tool loop for the in-app AI assistant.
 * The model runs server-side (/api/assistant); tools run here so they reuse
 * the same optimistic task updates and plan limits as the rest of the UI.
 */
export function useAssistant({ tasks, addTask, updateTask, userName, isPro, taskLimit }) {
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const apiMessagesRef = useRef([])
  const abortRef = useRef(null)
  const busyRef = useRef(false)
  const latestRef = useRef({ tasks, addTask, updateTask, userName, isPro, taskLimit })

  useEffect(() => {
    latestRef.current = { tasks, addTask, updateTask, userName, isPro, taskLimit }
  })

  const buildContext = () => {
    const { tasks, userName, isPro, taskLimit } = latestRef.current
    const now = new Date()
    return {
      today: format(now, 'yyyy-MM-dd'),
      todayLabel: format(now, 'EEEE, d MMMM yyyy', { locale: localeId }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userName,
      isPro,
      taskLimit,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        task_type: t.task_type,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        start_time: t.start_time,
        end_time: t.end_time,
        is_recurring: t.is_recurring,
        recurrence_period: t.recurrence_period,
        notes: t.notes,
      })),
    }
  }

  // `step` is a Gemini function_call step: { type, id, name, arguments }
  const runTool = async (step) => {
    const { addTask, updateTask, tasks } = latestRef.current
    const input = step.arguments && typeof step.arguments === 'object' ? step.arguments : {}
    const fail = (error, title = '') => ({
      ok: false,
      result: { error },
      action: { kind: 'error', label: 'Gagal', title, meta: error },
    })

    try {
      if (step.name === 'create_task' || step.name === 'create_schedule') {
        const isSchedule = step.name === 'create_schedule'
        const title = cleanText(input.title, 120)
        const date = isSchedule ? input.date : input.deadline
        const priority = PRIORITIES.includes(input.priority) ? input.priority : 'Medium'
        const notes = cleanText(input.notes, 500)
        if (!title) return fail('Judul kosong.')
        if (!isDate(date)) return fail('Tanggal harus berformat YYYY-MM-DD.', title)

        let payload = { title, deadline: date, priority, notes, task_type: 'task', status: 'todo', is_recurring: false }
        if (isSchedule) {
          const { start_time, end_time } = input
          if (!TIME_RE.test(start_time ?? '') || !TIME_RE.test(end_time ?? '')) return fail('Jam harus berformat HH:MM.', title)
          if (start_time >= end_time) return fail('Jam selesai harus setelah jam mulai.', title)
          payload = { ...payload, task_type: 'schedule', start_time, end_time, recurrence_period: 'daily', recurring_days: '' }
        }

        const task = await addTask(payload)
        const when = isSchedule ? `${shortDate(date)}, ${input.start_time}–${input.end_time}` : `Deadline ${shortDate(date)}`
        return {
          ok: true,
          result: { ok: true, task: { id: task.id, title: task.title, deadline: task.deadline } },
          action: { kind: 'create', label: isSchedule ? 'Jadwal dibuat' : 'Tugas dibuat', title, meta: `${when} · ${priority}`, taskId: task.id },
        }
      }

      if (step.name === 'update_task') {
        const task = tasks.find((t) => t.id === input.task_id)
        if (!task) return fail('Tugas dengan id itu tidak ditemukan.')

        const updates = {}
        const changes = []
        if (input.status !== undefined) {
          if (!STATUSES.includes(input.status)) return fail('Status tidak valid.', task.title)
          updates.status = input.status
          changes.push(`Status → ${STATUS_LABEL[input.status]}`)
        }
        if (input.priority !== undefined) {
          if (!PRIORITIES.includes(input.priority)) return fail('Prioritas tidak valid.', task.title)
          updates.priority = input.priority
          changes.push(`Prioritas → ${input.priority}`)
        }
        if (input.deadline !== undefined) {
          if (!isDate(input.deadline)) return fail('Tanggal harus berformat YYYY-MM-DD.', task.title)
          updates.deadline = input.deadline
          changes.push(`Deadline → ${shortDate(input.deadline)}`)
        }
        if (input.title !== undefined) {
          const title = cleanText(input.title, 120)
          if (!title) return fail('Judul kosong.', task.title)
          updates.title = title
          changes.push('Judul diubah')
        }
        if (input.notes !== undefined) {
          updates.notes = cleanText(input.notes, 500) || null
          changes.push('Catatan diubah')
        }
        if (changes.length === 0) return fail('Tidak ada perubahan yang diminta.', task.title)

        const updated = await updateTask(task.id, updates)
        return {
          ok: true,
          result: { ok: true, task: { id: updated.id, title: updated.title, status: updated.status, deadline: updated.deadline, priority: updated.priority } },
          action: { kind: 'update', label: 'Tugas diperbarui', title: updated.title, meta: changes.join(', '), taskId: updated.id },
        }
      }

      return fail(`Tool tidak dikenal: ${step.name}`)
    } catch (err) {
      return fail(err?.message || 'Gagal menyimpan ke database.', cleanText(input.title, 120))
    }
  }

  const streamTurn = async (history, signal, handlers) => {
    const { data } = await supabase.auth.getSession()
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ input: history, context: buildContext() }),
      signal,
    })

    if (!res.ok || !res.body) {
      let payload = {}
      try {
        payload = await res.json()
      } catch {
        // non-JSON error page (e.g. proxy); fall through to the generic message
      }
      throw new AssistantError(payload.error || `Gagal menghubungi asisten (${res.status}).`, payload.code)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let final = null
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let newline
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (!line) continue
        const event = JSON.parse(line)
        if (event.type === 'text') handlers.onText(event.text)
        else if (event.type === 'tool') handlers.onTool(event.name)
        else if (event.type === 'message') final = event.message
        else if (event.type === 'error') throw new AssistantError(event.error, event.code)
      }
    }
    if (!final) throw new AssistantError('Koneksi terputus. Coba lagi.')
    return final
  }

  const send = useCallback(async (rawText) => {
    const text = rawText.trim()
    if (!text || busyRef.current) return

    const snapshot = apiMessagesRef.current
    const assistantId = uid()
    const patch = (fn) => setMessages((all) => all.map((m) => (m.id === assistantId ? fn(m) : m)))

    // parts keeps text and tool results in the order they happened
    setMessages((all) => [
      ...all,
      { id: uid(), role: 'user', text },
      { id: assistantId, role: 'assistant', parts: [], pending: true, activity: 'thinking', error: null, retryText: text },
    ])

    if (snapshot.length >= MAX_HISTORY_ITEMS) {
      patch((m) => ({ ...m, pending: false, activity: null, error: 'Percakapan sudah panjang. Mulai percakapan baru, ya.' }))
      return
    }

    busyRef.current = true
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller
    // Gemini Interactions history: user_input items + the model's own steps
    let history = [...snapshot, { type: 'user_input', content: [{ type: 'text', text }] }]

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let startOfRound = true
        const turn = await streamTurn(history, controller.signal, {
          onText: (delta) => {
            const newPart = startOfRound
            startOfRound = false
            patch((m) => {
              const last = m.parts.at(-1)
              const parts =
                !newPart && last?.type === 'text'
                  ? [...m.parts.slice(0, -1), { type: 'text', text: last.text + delta }]
                  : [...m.parts, { type: 'text', text: delta }]
              return { ...m, parts, activity: null }
            })
          },
          onTool: () => patch((m) => ({ ...m, activity: 'tool' })),
        })

        const steps = Array.isArray(turn.steps) ? turn.steps : []
        const calls = steps.filter((s) => s.type === 'function_call')

        history = [...history, ...steps]
        if (calls.length === 0) break

        const results = []
        for (const call of calls) {
          const outcome = await runTool(call)
          results.push({
            type: 'function_result',
            call_id: call.id,
            name: call.name,
            result: [{ type: 'text', text: JSON.stringify(outcome.result) }],
            ...(outcome.ok ? {} : { is_error: true }),
          })
          patch((m) => ({ ...m, parts: [...m.parts, { type: 'action', action: outcome.action }] }))
        }
        history = [...history, ...results]
        patch((m) => ({ ...m, activity: 'thinking' }))
      }

      apiMessagesRef.current = history
      patch((m) => ({ ...m, pending: false, activity: null, retryText: null }))
    } catch (err) {
      // Keep the API transcript valid: drop this whole exchange
      apiMessagesRef.current = snapshot
      const aborted = err?.name === 'AbortError' || err?.code === 'aborted'
      patch((m) => ({
        ...m,
        pending: false,
        activity: null,
        error: aborted ? 'Dihentikan.' : err?.message || 'Terjadi kesalahan. Coba lagi.',
        retryText: err?.code === 'refusal' ? null : m.retryText,
      }))
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      busyRef.current = false
      setBusy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stop = useCallback(() => abortRef.current?.abort(), [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    apiMessagesRef.current = []
    setMessages([])
  }, [])

  const retry = useCallback((assistantId, text) => {
    setMessages((all) => {
      const index = all.findIndex((m) => m.id === assistantId)
      return index < 1 ? all : all.filter((_, i) => i !== index && i !== index - 1)
    })
    send(text)
  }, [send])

  return { messages, busy, send, stop, reset, retry }
}
