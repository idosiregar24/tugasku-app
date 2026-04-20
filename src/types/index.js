/**
 * @typedef {'Low' | 'Medium' | 'High'} Priority
 * @typedef {'todo' | 'finished' | 'done'} TaskStatus
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string} deadline - ISO date (YYYY-MM-DD)
 * @property {Priority} priority
 * @property {string} [notes]
 * @property {TaskStatus} status
 * @property {string} created_at
 * @property {string} [completed_at] - ISO date when task was marked as done or finished
 */

export const PRIORITIES = /** @type {Priority[]} */ (['Low', 'Medium', 'High'])
export const FREE_TASK_LIMIT = 15
