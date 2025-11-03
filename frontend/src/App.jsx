import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:8000/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks/`)
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/tasks/`, newTask)
      setNewTask({ title: '', description: '' })
      fetchTasks()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId, completed) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/`, { completed: !completed })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}/`)
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Django + React Demo</h1>
          <p>Full-stack application with ngrok, Docker & Kubernetes</p>
        </header>

        <div className="task-form">
          <h2>Add New Task</h2>
          <form onSubmit={addTask}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Task title"
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
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        <div className="task-list">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <span className="task-date">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="task-actions">
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
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

        <div className="health-check">
          <button onClick={async () => {
            try {
              const response = await axios.get(`${API_BASE}/health/`)
              alert(`Backend Health: ${response.data.status}`)
            } catch (error) {
              alert('Backend is not responding')
            }
          }}>
            Check Backend Health
          </button>
        </div>
      </div>
    </div>
  )
}

export default App