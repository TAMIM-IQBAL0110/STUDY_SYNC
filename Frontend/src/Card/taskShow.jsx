import React from 'react';
import { FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TaskShow = ({ Icon, Heading, Tasks, footer, handleCompleteTask, handleDeleteTask, navigate }) => {
  return (
    <div
      className="rounded-xl p-6 shadow-lg"
      style={{ backgroundColor: 'oklch(1 0.03 245)' }}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
        <Icon size={24} />
        {Heading}
      </h2>

      {Tasks && Tasks.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Tasks.slice(0, 10).map((task) => (
            <div
              key={task._id}
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p style={{ color: 'oklch(0.15 0.06 245)' }} className="font-medium">
                    {task.taskName}
                  </p>
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs mt-1 font-semibold">
                    Start Time: {new Date(task.date).toLocaleDateString('en-GB')} • {task.startTimeFormatted || 'N/A'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCompleteTask(task._id, task.status)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ backgroundColor: 'oklch(0.5 0.06 160)', color: 'white' }}
                    title="Mark complete"
                  >
                    <FiCheckCircle size={18} />
                  </button>

                  <button
                    onClick={() => navigate(`/dashboard/edit-task/${task._id}`)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ backgroundColor: 'oklch(0.4 0.1 65)', color: 'white' }}
                    title="Edit task"
                  >
                    <FiEdit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ backgroundColor: 'oklch(0.5 0.06 30)', color: 'white' }}
                    title="Delete task"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {task.description && (
                <div
                  className="p-3 rounded-lg mt-3"
                  style={{ backgroundColor: 'oklch(1 0.03 245)' }}
                >
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
          {footer}
        </p>
      )}
    </div>
  );
};

export default TaskShow;
