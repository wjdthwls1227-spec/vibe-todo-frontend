import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vibe-todo-backand.onrender.com/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 할일 목록 불러오기
  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}`)
      if (!response.ok) {
        throw new Error('할일 목록을 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      console.error('할일 목록 조회 실패:', err)
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        API_URL: API_BASE_URL
      })
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError(`백엔드 서버에 연결할 수 없습니다. 
        
확인 사항:
1. 백엔드 서버가 정상적으로 실행 중인지 확인
2. 브라우저 콘솔(F12)에서 Network 탭 확인
3. CORS 설정 확인

에러: ${err.message}`)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 할일 목록 불러오기
  useEffect(() => {
    fetchTodos()
  }, [])

  // 할일 추가
  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) {
      setError('할일 제목을 입력해주세요')
      return
    }

    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodoTitle }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '할일 추가에 실패했습니다')
      }

      const newTodo = await response.json()
      setTodos([newTodo, ...todos])
      setNewTodoTitle('')
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 정상적으로 실행 중인지 확인해주세요.')
      } else {
        setError(err.message)
      }
      console.error('할일 추가 실패:', err)
    }
  }

  // 할일 완료 상태 토글
  const handleToggleComplete = async (id, currentCompleted) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      })

      if (!response.ok) {
        throw new Error('할일 상태 변경에 실패했습니다')
      }

      const updatedTodo = await response.json()
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo))
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('백엔드 서버에 연결할 수 없습니다.')
      } else {
        setError(err.message)
      }
      console.error('할일 상태 변경 실패:', err)
    }
  }

  // 할일 삭제
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('할일 삭제에 실패했습니다')
      }

      setTodos(todos.filter(todo => todo._id !== id))
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('백엔드 서버에 연결할 수 없습니다.')
      } else {
        setError(err.message)
      }
      console.error('할일 삭제 실패:', err)
    }
  }

  // 할일 제목 수정
  const handleEditTitle = async (id, newTitle) => {
    if (!newTitle.trim()) {
      setError('할일 제목은 비어있을 수 없습니다')
      return
    }

    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        throw new Error('할일 수정에 실패했습니다')
      }

      const updatedTodo = await response.json()
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo))
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('백엔드 서버에 연결할 수 없습니다.')
      } else {
        setError(err.message)
      }
      console.error('할일 수정 실패:', err)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>할일 관리</h1>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}

        {/* 할일 추가 폼 */}
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="새로운 할일을 입력하세요..."
            className="todo-input"
          />
          <button type="submit" className="add-button">추가</button>
        </form>

        {/* 할일 목록 */}
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : todos.length === 0 ? (
          <div className="empty-state">할일이 없습니다. 새로운 할일을 추가해보세요!</div>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onEditTitle={handleEditTitle}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// 할일 아이템 컴포넌트
function TodoItem({ todo, onToggleComplete, onDelete, onEditTitle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      onEditTitle(todo._id, editTitle)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo._id, todo.completed)}
        className="todo-checkbox"
      />
      
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="todo-edit-input"
        />
      ) : (
        <span
          className="todo-title"
          onDoubleClick={() => setIsEditing(true)}
        >
          {todo.title}
        </span>
      )}

      <div className="todo-actions">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="edit-button"
            title="수정"
          >
            ✏️
          </button>
        )}
        <button
          onClick={() => onDelete(todo._id)}
          className="delete-button"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}

export default App
