import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const TaskList = ({ selectedDate, userRole, currentUserId, refreshKey = 0 }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [respondingTaskId, setRespondingTaskId] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      fetchTasks();
    }
  }, [selectedDate, refreshKey]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tasks', {
        params: { date: selectedDate.toISOString().split('T')[0] },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(
        `/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const respondToManager = async (taskId, newStatus) => {
    setRespondingTaskId(taskId);
    await updateTaskStatus(taskId, newStatus);
    setRespondingTaskId(null);
    setExpandedTaskId(null);
  };

  const priorityBadge = (p) => {
    const map = { low: 'ta-badge-success', medium: 'ta-badge-warning', high: 'ta-badge-danger', critical: 'ta-badge-danger' };
    return map[p] || 'ta-badge-primary';
  };
  const statusBadge = (s) => {
    const map = { completed: 'ta-badge-success', in_progress: 'ta-badge-primary', pending: 'ta-badge-warning', pending_review: 'ta-badge-warning' };
    return map[s] || 'ta-badge-primary';
  };

  const canUpdateStatus = (task) => {
    if (userRole === 'employee') return true;

    const isManagerReviewFlowTask = task.creator?.role === 'manager' && task.assignee?.role === 'employer';

    if (userRole === 'employer') {
      return isManagerReviewFlowTask && task.assigned_to === currentUserId;
    }

    if (userRole === 'manager') {
      return isManagerReviewFlowTask && task.created_by === currentUserId;
    }

    return false;
  };

  const statusOptions = (task) => {
    if (userRole === 'employee') {
      return [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ];
    }

    if (userRole === 'employer') {
      return [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'pending_review', label: 'Pending Review' },
      ];
    }

    if (userRole === 'manager') {
      return [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'pending_review', label: 'Pending Review' },
        { value: 'completed', label: 'Completed (Reviewed)' },
      ];
    }

    return [];
  };

  const isPendingManagerTaskForEmployer = (task) => (
    userRole === 'employer'
    && task.assigned_to === currentUserId
    && task.creator?.role === 'manager'
    && task.status === 'pending'
  );

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between">
        <h2 className="font-semibold text-sidebar">Tasks — {selectedDate?.toDateString()}</h2>
        <span className="text-sm text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="ta-card-body">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stroke border-t-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No tasks assigned for this date.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="pb-3 text-left font-semibold text-gray-500">Task</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Priority</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Due</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Status</th>
                  {(userRole === 'employee' || userRole === 'employer' || userRole === 'manager') && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {tasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-sidebar">{task.title}</p>
                      {task.description && <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{task.description}</p>}
                      {task.creator?.name && <p className="mt-1 text-xs text-gray-400">by {task.creator.name}</p>}
                      {isPendingManagerTaskForEmployer(task) && (
                        <button
                          type="button"
                          onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                          className="mt-2 text-xs font-semibold text-primary hover:underline"
                        >
                          {expandedTaskId === task.id ? 'Hide response actions' : 'Click to answer manager'}
                        </button>
                      )}
                      {expandedTaskId === task.id && isPendingManagerTaskForEmployer(task) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => respondToManager(task.id, 'in_progress')}
                            disabled={respondingTaskId === task.id}
                            className="ta-btn-secondary !px-3 !py-1 !text-xs disabled:opacity-60"
                          >
                            Start Task
                          </button>
                          <button
                            type="button"
                            onClick={() => respondToManager(task.id, 'pending_review')}
                            disabled={respondingTaskId === task.id}
                            className="ta-btn-primary !px-3 !py-1 !text-xs disabled:opacity-60"
                          >
                            Send to Manager
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={priorityBadge(task.priority)}>{task.priority}</span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={statusBadge(task.status)}>{task.status?.replace('_', ' ')}</span>
                    </td>
                    {(userRole === 'employee' || userRole === 'employer' || userRole === 'manager') && (
                      <td className="py-4">
                        {canUpdateStatus(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="ta-input !py-1 !text-xs"
                          >
                            {statusOptions(task).map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">Read only</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
