import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:8000/api'
function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({})
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 2 
  })
  const [loading, setLoading] = useState(false)

 
  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks/`)
      setTasks(response.data.results)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks/stats/`)
      console.log('Fetched tasks:', response.data.results, response.data)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/tasks/`, newTask)
      setNewTask({ title: '', description: '', priority: 2 })
      fetchTasks()
      fetchStats()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskComplete = async (taskId) => {
    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/toggle_complete/`)
      fetchTasks()
      fetchStats()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}/`)
      fetchTasks()
      fetchStats()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High' }
    return labels[priority] || 'Medium'
  }
  const getPriorityClass = (priority) => {
    const classes = { 1: 'priority-low', 2: 'priority-medium', 3: 'priority-high' }
    return classes[priority] || 'priority-medium'
  }


  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Django + React + PostgreSQL Demo</h1>
          <p>Full-stack application with Docker, Ngrok & Kubernetes</p>
        </header>

        {/* Statistics */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.total_tasks || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed_tasks || 0}</p>
          </div>
          <div className="stat-card">
            <h3>High Priority</h3>
            <p className="stat-number">{stats.high_priority_tasks || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Overdue</h3>
            <p className="stat-number">{stats.overdue_tasks || 0}</p>
          </div>
        </div>

        {/* Task Form */}
        <div className="task-form">
          <h2>Add New Task</h2>
          <form onSubmit={addTask}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Task title *"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select 
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>
        
        {/* Task List */}
        <div className="task-list">
          <h2>Tasks ({tasks.count})</h2>
          {tasks.count === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    {task.due_date && (
                      <span className={task.is_overdue ? 'overdue' : ''}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {task.logs && task.logs.length > 0 && (
                    <div className="task-logs">
                      <small>Last activity: {new Date(task.logs[0].timestamp).toLocaleString()}</small>
                    </div>
                  )}
                </div>
                <div className="task-actions">
                  <button 
                    onClick={() => toggleTaskComplete(task.id)}
                    className={task.completed ? 'btn-completed' : 'btn-incomplete'}
                  >
                    {task.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Health Check */}
        <div className="health-check">
          <button onClick={async () => {
            try {
              const response = await axios.get(`${API_BASE}/health/`)
              alert(`Backend Health: ${response.data.status}\nDatabase: ${response.data.database}`)
            } catch (error) {
              alert('Backend is not responding')
            }
          }}>
            Check Backend & Database Health
          </button>
        </div>
      </div>
    </div>
  )
}

export default App