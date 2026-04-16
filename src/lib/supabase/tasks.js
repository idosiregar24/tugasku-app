import { supabase } from './client'

/**
 * Fetch all tasks for a specific user, ordered newest first
 * @param {string} userId
 * @returns {Promise<import('@/types').Task[]>}
 */
export async function getTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Insert a new task
 * @param {Partial<import('@/types').Task>} task
 * @returns {Promise<import('@/types').Task>}
 */
export async function addTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing task
 * @param {string} id
 * @param {Partial<import('@/types').Task>} updates
 * @returns {Promise<import('@/types').Task>}
 */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a task by ID
 * @param {string} id
 */
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
