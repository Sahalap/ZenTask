import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { Plus, ListTodo, Play, CheckCircle, Search } from 'lucide-react';

const DashboardView = () => {
  const { token, apiUrl, showToast, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminViewScope, setAdminViewScope] = useState('mine'); // 'mine' or 'all' for admin users

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null); // Null for create, Task object for edit

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let queryParams = [];

      if (priorityFilter) queryParams.push(`priority=${priorityFilter}`);
      if (statusFilter) queryParams.push(`status=${statusFilter}`);
      if (searchQuery) queryParams.push(`search=${searchQuery}`);

      // Admin filter
      if (user.role === 'ADMIN' && adminViewScope === 'mine') {
        queryParams.push(`userId=${user.id}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const response = await fetch(`${apiUrl}/tasks${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks.');
      }
      setTasks(data.tasks);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter, statusFilter, searchQuery, adminViewScope]);

  const handleCreateOrUpdate = async (taskData) => {
    try {
      let response;
      if (activeTask) {
        // Update task
        response = await fetch(`${apiUrl}/tasks/${activeTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
      } else {
        // Create task
        response = await fetch(`${apiUrl}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save task.');
      }

      showToast(data.message, 'success');
      setIsModalOpen(false);
      setActiveTask(null);
      fetchTasks();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status.');
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      showToast('Task status shifted successfully.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task.');
      }
      showToast(data.message, 'success');
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openCreateModal = () => {
    setActiveTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setActiveTask(task);
    setIsModalOpen(true);
  };

  // Metrics trackers
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const progressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  const getPercentage = (count) => {
    if (totalTasks === 0) return 0;
    return Math.round((count / totalTasks) * 100);
  };

  return (
    <div style={{ animation: 'slideUp var(--transition-normal)' }}>
      {/* Dashboard KPI Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-info">
            <h4>Workspace Tasks</h4>
            <div className="metric-val">{totalTasks}</div>
          </div>
          <div className="metric-icon-wrapper cyan">
            <ListTodo size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Pending ({getPercentage(pendingTasks)}%)</h4>
            <div className="metric-val">{pendingTasks}</div>
          </div>
          <div className="metric-icon-wrapper coral">
            <ListTodo size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>In Progress ({getPercentage(progressTasks)}%)</h4>
            <div className="metric-val">{progressTasks}</div>
          </div>
          <div className="metric-icon-wrapper amber">
            <Plus size={22} style={{ transform: 'rotate(45deg)' }} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h4>Completed ({getPercentage(completedTasks)}%)</h4>
            <div className="metric-val">{completedTasks}</div>
          </div>
          <div className="metric-icon-wrapper green">
            <CheckCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filtering & Actions Panel */}
      <div className="controls-panel">
        <div className="filters-box">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', opacity: 0.5 }} />
            <input
              type="text"
              className="search-field"
              placeholder="Search task title/description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {user.role === 'ADMIN' && (
            <select
              className="select-filter"
              value={adminViewScope}
              onChange={(e) => setAdminViewScope(e.target.value)}
              style={{ borderColor: 'hsl(var(--color-warning))', fontWeight: 700 }}
            >
              <option value="mine">Show My Tasks Only</option>
              <option value="all">Show All Users' Tasks</option>
            </select>
          )}
        </div>

        <button className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.25rem' }} onClick={openCreateModal}>
          <Plus size={18} /> Create Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'hsl(var(--text-secondary))' }}>
          <span>Syncing workspace nodes...</span>
        </div>
      ) : (
        <div className="kanban-grid">
          {/* COLUMN: PENDING */}
          <div className="kanban-col">
            <div className="col-header">
              <div className="col-title" style={{ color: 'hsl(var(--color-danger))' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--color-danger))' }} />
                <span>Pending</span>
              </div>
              <span className="col-count">{pendingTasks}</span>
            </div>
            {tasks.filter((t) => t.status === 'PENDING').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                showOwner={adminViewScope === 'all'}
              />
            ))}
          </div>

          {/* COLUMN: IN PROGRESS */}
          <div className="kanban-col">
            <div className="col-header">
              <div className="col-title" style={{ color: 'hsl(var(--color-warning))' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--color-warning))' }} />
                <span>In Progress</span>
              </div>
              <span className="col-count">{progressTasks}</span>
            </div>
            {tasks.filter((t) => t.status === 'IN_PROGRESS').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                showOwner={adminViewScope === 'all'}
              />
            ))}
          </div>

          {/* COLUMN: COMPLETED */}
          <div className="kanban-col">
            <div className="col-header">
              <div className="col-title" style={{ color: 'hsl(var(--color-success))' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--color-success))' }} />
                <span>Completed</span>
              </div>
              <span className="col-count">{completedTasks}</span>
            </div>
            {tasks.filter((t) => t.status === 'COMPLETED').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                showOwner={adminViewScope === 'all'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Task Creation/Editing Modal */}
      {isModalOpen && (
        <TaskModal
          task={activeTask}
          onSave={handleCreateOrUpdate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardView;
