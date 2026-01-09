import React from 'react';
import { FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { parseDateOnlyLocal } from '../utilities/dateUtils.js';

const TaskShow = ({ Icon, Heading, Tasks, footer, handleCompleteTask, handleDeleteTask, navigate }) => {
  return (
    <div
      className="rounded-xl p-4 md:p-6 shadow-xl"
      style={{ backgroundColor: 'oklch(1 0.03 245)' }}
    >
      <div className="mb-3 md:mb-4">
        {typeof Heading === 'string' ? (
          <h2 className="text-base md:text-xl font-bold flex items-center gap-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
            <Icon size={20} className="md:size-5 flex-shrink-0" style={{ color: 'oklch(0.4 0.1 245)' }} />
            <span className="line-clamp-2">{Heading}</span>
          </h2>
        ) : (
          <div className="flex items-center gap-2">
            <Icon size={20} className="md:size-5 flex-shrink-0" style={{ color: 'oklch(0.4 0.1 245)' }} />
            <div className="flex-1">{Heading}</div>
          </div>
        )}
      </div>

      {Tasks && Tasks.length > 0 ? (
        <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
          {Tasks.slice(0, 10).map((task) => (
            <div
              key={task._id}
              className="p-3 md:p-4 rounded-lg"
              style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}
            >
              <div className="flex-1 min-w-0 mb-3">
                <p style={{ color: 'oklch(0.15 0.06 245)' }} className="font-medium text-sm md:text-base break-words">
                  {task.taskName}
                </p>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs mt-1 font-semibold">
                  Start Time: {parseDateOnlyLocal(task.date).toLocaleDateString('en-GB')} • {task.startTimeFormatted || 'N/A'}
                </p>
              </div>

              {task.description && (
                <div
                  className="p-2 md:p-3 rounded-lg mb-3"
                  style={{ backgroundColor: 'oklch(1 0.03 245)' }}
                >
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs md:text-sm break-words">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleCompleteTask(task._id, task.status)}
                  className="p-2.5 md:p-3 rounded-lg transition-all hover:scale-110 shadow-md"
                  style={{ backgroundColor: 'oklch(0.5 0.06 160)', color: 'white' }}
                  title="Mark complete"
                >
                  <FiCheckCircle size={16} className="md:size-18" />
                </button>

                <button
                  onClick={() => navigate(`/dashboard/edit-task/${task._id}`)}
                  className="p-2.5 md:p-3 rounded-lg transition-all hover:scale-110 shadow-md"
                  style={{ backgroundColor: 'oklch(0.4 0.1 65)', color: 'white' }}
                  title="Edit task"
                >
                  <FiEdit2 size={16} className="md:size-18" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2.5 md:p-3 rounded-lg transition-all hover:scale-110 shadow-md"
                  style={{ backgroundColor: 'oklch(0.5 0.06 30)', color: 'white' }}
                  title="Delete task"
                >
                  <FiTrash2 size={16} className="md:size-18" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs md:text-sm">
          {footer}
        </p>
      )}
    </div>
  );
};

export default TaskShow;
