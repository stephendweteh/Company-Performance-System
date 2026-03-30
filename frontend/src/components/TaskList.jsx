import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const TaskList = ({ selectedDate, userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchTasks();
    }
  }, [selectedDate]);

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

  const priorityBadge = (p) => {
    const map = { low: 'ta-badge-success', medium: 'ta-badge-warning', high: 'ta-badge-danger', critical: 'ta-badge-danger' };
    return map[p] || 'ta-badge-primary';
  };
  const statusBadge = (s) => {
    const map = { completed: 'ta-badge-success', in_progress: 'ta-badge-primary', pending: 'ta-badge-warning' };
    return map[s] || 'ta-badge-primary';
  };

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
                  {userRole === 'employee' && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {tasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-sidebar">{task.title}</p>
                      {task.description && <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{task.description}</p>}
                      {task.creator?.name && <p className="mt-1 text-xs text-gray-400">by {task.creator.name}</p>}
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
                    {userRole === 'employee' && (
                      <td className="py-4">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="ta-input !py-1 !text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
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
