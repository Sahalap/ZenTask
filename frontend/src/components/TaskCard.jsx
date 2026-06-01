import React from 'react';
import { Calendar, Trash2, Edit3, User, ArrowLeft, ArrowRight } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, showOwner = false }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getNextStatus = (current) => {
    if (current === 'PENDING') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'COMPLETED';
    return null;
  };

  const getPrevStatus = (current) => {
    if (current === 'COMPLETED') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'PENDING';
    return null;
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  return (
    <div className={`task-card priority-${task.priority.toLowerCase()}`}>
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <div className="task-actions">
          <button className="action-btn" onClick={() => onEdit(task)} title="Edit Task">
            <Edit3 size={15} />
          </button>
          <button className="action-btn delete" onClick={() => onDelete(task.id)} title="Delete Task">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-footer">
        <div className="task-meta">
          <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
          {task.dueDate && (
            <span className="task-meta" style={{ marginLeft: '0.5rem' }}>
              <Calendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {showOwner && task.user && (
          <div className="owner-tag" title={task.user.email} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
            <User size={12} />
            <span>{task.user.name}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
        {prevStatus ? (
          <button 
            className="action-btn" 
            onClick={() => onStatusChange(task.id, prevStatus)} 
            title={`Move to ${prevStatus.replace('_', ' ')}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        ) : <div />}

        {nextStatus ? (
          <button 
            className="action-btn" 
            onClick={() => onStatusChange(task.id, nextStatus)} 
            title={`Move to ${nextStatus.replace('_', ' ')}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
          >
            Next <ArrowRight size={14} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};

export default TaskCard;
