import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { downloadSimplePdf } from '../utils/pdfExport';

export const TaskList = ({
  selectedDate,
  userRole,
  currentUserId,
  refreshKey = 0,
  focusedTaskId = null,
  onStatusChange,
  pendingOnly = false,
  onClearPendingOnly,
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [respondingTaskId, setRespondingTaskId] = useState(null);
  const [taskFiles, setTaskFiles] = useState({});
  const [taskTexts, setTaskTexts] = useState({});
  const [taskError, setTaskError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortDir, setSortDir] = useState('asc');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const isManagerViewingAllTasks = userRole === 'manager' && showAllTasks;

  useEffect(() => {
    fetchTasks();
  }, [selectedDate, refreshKey, isManagerViewingAllTasks, focusedTaskId]);

  useEffect(() => {
    if (!focusedTaskId) {
      return;
    }

    setSearchTerm('');
    setSortBy('due_date');
    setSortDir('asc');

    if ((userRole === 'manager' || userRole === 'employee') && !showAllTasks) {
      setShowAllTasks(true);
    }

    if (pendingOnly && onClearPendingOnly) {
      onClearPendingOnly();
    }
  }, [focusedTaskId, onClearPendingOnly, pendingOnly, showAllTasks, userRole]);

  useEffect(() => {
    if (!focusedTaskId || !tasks.some((task) => task.id === focusedTaskId)) {
      return;
    }

    setExpandedTaskId(focusedTaskId);

    requestAnimationFrame(() => {
      const row = document.querySelector(`[data-task-id="${focusedTaskId}"]`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focusedTaskId, tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = selectedDate && !isManagerViewingAllTasks && !focusedTaskId
        ? { date: selectedDate.toISOString().split('T')[0] }
        : {};
      const response = await axios.get('/api/tasks', {
        params,
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
      onStatusChange && onStatusChange();
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

  const handleTaskFileChange = (taskId, files) => {
    const selectedFiles = Array.from(files || []).slice(0, 5);
    setTaskFiles((prev) => ({ ...prev, [taskId]: selectedFiles }));
  };

  const handleTaskTextChange = (taskId, value) => {
    setTaskTexts((prev) => ({ ...prev, [taskId]: value }));
  };

  const submitTaskWithFiles = async (taskId, status) => {
    setRespondingTaskId(taskId);
    setTaskError('');

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('status', status);
      formData.append('submission_text', taskTexts[taskId] || '');

      (taskFiles[taskId] || []).forEach((file) => {
        formData.append('attachments[]', file);
      });

      await axios.post(`/api/tasks/${taskId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setExpandedTaskId(null);
      setTaskFiles((prev) => ({ ...prev, [taskId]: [] }));
      setTaskTexts((prev) => ({ ...prev, [taskId]: '' }));
      fetchTasks();
      onStatusChange && onStatusChange();
    } catch (error) {
      const err = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : error.response?.data?.message || 'Error updating task';
      setTaskError(err);
    }

    setRespondingTaskId(null);
  };

  const priorityBadge = (p) => {
    const map = { low: 'ta-badge-success', medium: 'ta-badge-warning', high: 'ta-badge-danger', critical: 'ta-badge-danger' };
    return map[p] || 'ta-badge-primary';
  };
  const priorityLabel = (p) => {
    const map = { critical: 'C', high: 'H', medium: 'M', low: 'L' };
    return map[p] || p;
  };
  const statusBadge = (s) => {
    const map = { completed: 'ta-badge-success', in_progress: 'ta-badge-primary', pending: 'ta-badge-warning', pending_review: 'ta-badge-warning' };
    return map[s] || 'ta-badge-primary';
  };

  const canUpdateStatus = (task) => {
    const isManagerReviewFlowTask = task.creator?.role === 'manager' && task.assignee?.role === 'employer';
    const isEmployerReviewFlowTask = task.creator?.role === 'employer' && task.assignee?.role === 'employee';

    if (userRole === 'employee') {
      return false;
    }

    if (userRole === 'employer') {
      return isEmployerReviewFlowTask && task.created_by === currentUserId;
    }

    if (userRole === 'manager') {
      return isManagerReviewFlowTask && task.created_by === currentUserId;
    }

    return false;
  };

  const statusOptions = (task) => {
    if (userRole === 'employee') {
      if (task.creator?.role === 'employer' && task.assignee?.role === 'employee') {
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'pending_review', label: 'Pending Review' },
        ];
      }

      return [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ];
    }

    if (userRole === 'employer') {
      if (task.creator?.role === 'employer' && task.assignee?.role === 'employee') {
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'pending_review', label: 'Pending Review' },
          { value: 'completed', label: 'Completed (Reviewed)' },
        ];
      }

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
    && task.status !== 'completed'
    && (task.creator?.role === 'manager' || !task.creator?.role)
  );

  const isActionableEmployerTaskForEmployee = (task) => (
    userRole === 'employee'
    && task.assigned_to === currentUserId
    && (task.creator?.role === 'employer' || !task.creator?.role)
    && (task.status === 'pending' || task.status === 'in_progress')
  );

  const extractSubmissionNotes = (description) => {
    if (!description) return null;
    const match = description.match(/Submission Note \([^)]+\)\n([\s\S]*?)(?=\n*$)/);
    return match ? match[1].trim() : null;
  };

  const getOriginalDescription = (description) => {
    if (!description) return '';
    return description.split(/Submission Note \([^)]+\)/)[0].trim();
  };

  const isEmployerTaskWithSubmission = (task) => (
    userRole === 'manager'
    && task.assignee?.role === 'employer'
    && task.creator?.role === 'manager'
    && (task.status === 'in_progress' || task.status === 'pending_review')
  );

  const isEmployeeTaskWithSubmission = (task) => (
    userRole === 'employer'
    && task.assignee?.role === 'employee'
    && task.creator?.role === 'employer'
    && task.created_by === currentUserId
    && (task.status === 'in_progress' || task.status === 'pending_review')
  );

  const filterTasks = () => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
        || task.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (!pendingOnly && !(userRole === 'employee' && !showAllTasks)) return true;
      
      // If pendingOnly from calendar click, show pending tasks
      if (pendingOnly) {
        return task.status === 'pending';
      }
      
      // If employee viewing pending only (not showAllTasks)
      if (userRole === 'employee' && !showAllTasks) {
        const isActionable = ['pending', 'in_progress', 'pending_review'].includes(task.status);
        return isActionable;
      }
      
      return true;
    });
  };

  const sortTasks = (tasksToSort) => {
    const sorted = [...tasksToSort];
    sorted.sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'due_date') {
        aVal = new Date(a.due_date || 0);
        bVal = new Date(b.due_date || 0);
      } else if (sortBy === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        aVal = priorityOrder[a.priority] || 0;
        bVal = priorityOrder[b.priority] || 0;
      } else if (sortBy === 'status') {
        aVal = a.status;
        bVal = b.status;
      } else if (sortBy === 'assignee') {
        aVal = a.assignee?.name || '';
        bVal = b.assignee?.name || '';
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const exportTasksCSV = () => {
    const filtered = filterTasks();
    const headers = ['Title', 'Description', 'Assigned To', 'Priority', 'Due Date', 'Status'];
    const rows = filtered.map((task) => [
      task.title,
      task.description,
      task.assignee?.name || '-',
      task.priority,
      new Date(task.due_date).toLocaleDateString(),
      task.status?.replace('_', ' '),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportTasksPDF = () => {
    const tasksToExport = sortTasks(filterTasks());
    if (tasksToExport.length === 0) {
      alert('No tasks to export');
      return;
    }

    const blocks = tasksToExport.flatMap((task, index) => ([
      { text: `${index + 1}. ${task.title}`, fontSize: 12, bold: true, gapAfter: 4 },
      {
        text: `Assigned To: ${task.assignee?.name || '-'} | Priority: ${task.priority || 'N/A'} | Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'} | Status: ${task.status?.replace('_', ' ') || 'N/A'}`,
        fontSize: 10,
        gapAfter: 4,
      },
      { text: task.description || 'No description provided.', fontSize: 10, gapAfter: 10 },
    ]));

    downloadSimplePdf({
      filename: `tasks-${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Tasks Report',
      blocks,
    });
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between">
        <h2 className="font-semibold text-sidebar">
          {isManagerViewingAllTasks
            ? 'All Tasks'
            : selectedDate
              ? `Tasks — ${selectedDate.toDateString()}`
              : 'Tasks'}
        </h2>
        <span className="text-sm text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="ta-card-body">
        {pendingOnly && userRole === 'employee' && (
          <div className="mb-4 flex items-center justify-between rounded border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            <span>Showing pending tasks for the selected date.</span>
            <button
              type="button"
              className="font-semibold underline hover:no-underline"
              onClick={() => onClearPendingOnly && onClearPendingOnly()}
            >
              Show all tasks
            </button>
          </div>
        )}

        {/* Search, Sort, Export Controls */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="ta-label !mb-1">Search</label>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ta-input"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="ta-label !mb-1">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ta-input">
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>
          <div className="w-full md:w-24">
            <label className="ta-label !mb-1">Order</label>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="ta-input">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button onClick={exportTasksCSV} className="ta-btn-secondary h-10">
            📥 Export CSV
          </button>
          <button onClick={exportTasksPDF} className="ta-btn-secondary h-10">
            📄 Export PDF
          </button>
          {userRole === 'manager' && (
            <button
              type="button"
              className="ta-btn-secondary h-10"
              onClick={() => setShowAllTasks((prev) => !prev)}
            >
              {showAllTasks ? 'Show Selected Date' : 'View All Tasks'}
            </button>
          )}
          {userRole === 'employee' && (
            <button
              className="ta-btn-secondary h-10"
              onClick={() => setShowAllTasks((prev) => !prev)}
            >
              {showAllTasks ? 'Show Pending Only' : 'Show All Tasks'}
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stroke border-t-primary" />
          </div>
        ) : filterTasks().length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            {userRole === 'employee' && !showAllTasks
              ? 'No pending tasks assigned to you.'
              : userRole === 'manager' && showAllTasks
                ? 'No tasks available.'
                : 'No tasks assigned for this date.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="pb-3 text-left font-semibold text-gray-500">Task</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Priority</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Due</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Status</th>
                  {(userRole === 'employee' || userRole === 'employer' || userRole === 'manager') && (
                    <th className="pb-3 text-left font-semibold text-gray-500">Update Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {sortTasks(filterTasks()).map((task) => (
                  <tr
                    key={task.id}
                    data-task-id={task.id}
                    className={`group transition-colors ${focusedTaskId === task.id ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-whiten'}`}
                  >
                    <td className="py-4 pr-4">
                      <p className="font-medium text-sidebar">{task.title}</p>
                      {userRole === 'manager' ? (
                        task.assignee?.name && <p className="mt-1 text-xs text-gray-400">Assigned to: {task.assignee.name}</p>
                      ) : (
                        task.creator?.name && <p className="mt-1 text-xs text-gray-400">by {task.creator.name}</p>
                      )}
                      {task.description && (
                        <>
                          {getOriginalDescription(task.description) && (
                            <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{getOriginalDescription(task.description)}</p>
                          )}
                          {(isEmployerTaskWithSubmission(task) || isEmployeeTaskWithSubmission(task)) && extractSubmissionNotes(task.description) && (
                            <div className="mt-2 rounded bg-blue-50 border border-blue-100 p-2">
                              <p className="text-xs font-semibold text-blue-900">📋 {task.assignee?.name}:</p>
                              <p className="mt-1 text-xs text-blue-800 line-clamp-3">{extractSubmissionNotes(task.description)}</p>
                              <button
                                type="button"
                                onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {expandedTaskId === task.id ? 'Hide full response' : 'View full response'}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-semibold text-gray-500">Attachments ({task.attachments.length}):</p>
                          {task.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={`/storage/${attachment.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-primary hover:underline truncate"
                              title={attachment.file_name}
                            >
                              📎 {attachment.file_name}
                            </a>
                          ))}
                        </div>
                      )}
                      {expandedTaskId === task.id && (isEmployerTaskWithSubmission(task) || isEmployeeTaskWithSubmission(task)) && (
                        <div className="mt-3 space-y-2 rounded border border-blue-200 bg-blue-50 p-3">
                          {extractSubmissionNotes(task.description) && (
                            <div>
                              <p className="text-xs font-semibold text-blue-900">{task.assignee?.name}'s Full Response:</p>
                              <p className="mt-1.5 whitespace-pre-wrap text-xs text-blue-800">{extractSubmissionNotes(task.description)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {expandedTaskId === task.id && isPendingManagerTaskForEmployer(task) && (
                        <div className="mt-3 space-y-3 rounded border border-stroke p-3">
                          {taskError && (
                            <p className="text-xs text-danger">{taskError}</p>
                          )}
                          <div>
                            <label className="ta-label !mb-1">Task Update / Notes</label>
                            <textarea
                              value={taskTexts[task.id] || ''}
                              onChange={(e) => handleTaskTextChange(task.id, e.target.value)}
                              className="ta-input !py-1.5 !text-xs"
                              rows={3}
                              placeholder="Write what you have done or need from the manager"
                            />
                          </div>
                          <div>
                            <label className="ta-label !mb-1">Attach Work Files (optional)</label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleTaskFileChange(task.id, e.target.files)}
                              className="ta-input !py-1.5 !text-xs"
                            />
                            {(taskFiles[task.id] || []).length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                {(taskFiles[task.id] || []).length} file(s) selected
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => submitTaskWithFiles(task.id, 'in_progress')}
                            disabled={respondingTaskId === task.id}
                            className="ta-btn-secondary !px-3 !py-1 !text-xs disabled:opacity-60"
                          >
                            Start Task
                          </button>
                          <button
                            type="button"
                            onClick={() => submitTaskWithFiles(task.id, 'pending_review')}
                            disabled={respondingTaskId === task.id}
                            className="ta-btn-primary !px-3 !py-1 !text-xs disabled:opacity-60"
                          >
                            Send to Manager
                          </button>
                        </div>
                        </div>
                      )}
                      {expandedTaskId === task.id && isActionableEmployerTaskForEmployee(task) && (
                        <div className="mt-3 space-y-3 rounded border border-stroke p-3">
                          {taskError && (
                            <p className="text-xs text-danger">{taskError}</p>
                          )}
                          <div>
                            <label className="ta-label !mb-1">Task Update / Notes</label>
                            <textarea
                              value={taskTexts[task.id] || ''}
                              onChange={(e) => handleTaskTextChange(task.id, e.target.value)}
                              className="ta-input !py-1.5 !text-xs"
                              rows={3}
                              placeholder="Write what you have done or any blocker for the employer"
                            />
                          </div>
                          <div>
                            <label className="ta-label !mb-1">Attach Work Files (optional)</label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleTaskFileChange(task.id, e.target.files)}
                              className="ta-input !py-1.5 !text-xs"
                            />
                            {(taskFiles[task.id] || []).length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                {(taskFiles[task.id] || []).length} file(s) selected
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => submitTaskWithFiles(task.id, 'in_progress')}
                                disabled={respondingTaskId === task.id}
                                className="ta-btn-secondary !px-3 !py-1 !text-xs disabled:opacity-60"
                              >
                                Start Task
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => submitTaskWithFiles(task.id, 'pending_review')}
                              disabled={respondingTaskId === task.id}
                              className="ta-btn-primary !px-3 !py-1 !text-xs disabled:opacity-60"
                            >
                              Send to Employer
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`${priorityBadge(task.priority)} min-w-[2rem] justify-center px-2 uppercase`}
                        title={`Priority: ${task.priority}`}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(task.status)}>{task.status?.replace('_', ' ')}</span>
                        {(isPendingManagerTaskForEmployer(task) || isActionableEmployerTaskForEmployee(task)) && (
                          <button
                            type="button"
                            onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                            className="ta-btn-primary !px-2 !py-1 !text-xs"
                          >
                            {expandedTaskId === task.id ? 'Hide' : 'Do Task'}
                          </button>
                        )}
                      </div>
                    </td>
                    {(userRole === 'employer' || userRole === 'manager') && (
                      <td className="py-4 min-w-[180px]">
                        {canUpdateStatus(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="ta-input min-w-[170px] bg-white !border-primary !py-2 !pr-9 !text-sm !font-semibold text-sidebar shadow-sm"
                          >
                            {statusOptions(task).map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">Read only</span>
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
