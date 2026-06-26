import React from 'react';

const SyllabusSection = ({
  getTaskDescription,
  handleAddCustomTask,
  handleDeleteTask,
  handleToggleTask,
  newTaskName,
  remainingCount,
  setNewTaskName,
  tasks,
}) => (
  <section className="lg:col-span-7 space-y-stack-md">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Today's Syllabus</h3>
      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm font-bold">{remainingCount} Tasks Remaining</span>
    </div>
    <form onSubmit={handleAddCustomTask} className="flex gap-2 bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm">
      <input
        type="text"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        placeholder="Add a custom task to today's schedule..."
        className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-on-surface"
        required
      />
      <button type="submit" className="px-3 sm:px-5 py-2.5 bg-primary text-white rounded-lg font-label-md text-xs sm:text-label-md font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1 cursor-pointer">
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>Add</span>
      </button>
    </form>
    <div className="space-y-3">
      {tasks.map((task) => {
        const isCompleted = task.status === 'Completed';
        return (
          <div
            key={task._id}
            className={`tonal-card rounded-xl border border-outline-variant/20 bg-white transition-all shadow-sm flex items-start gap-3 sm:gap-4 p-4 sm:p-5 ${
              isCompleted ? 'bg-surface-container-low/50 opacity-70' : 'hover:border-primary/30 cursor-pointer'
            }`}
            onClick={() => handleToggleTask(task._id, task.status)}
          >
            <div className={`mt-1 w-6 h-6 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${isCompleted ? 'bg-primary border-primary' : 'border-outline-variant hover:border-primary'}`}>
              {isCompleted && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <h4 className={`font-body-lg text-body-md sm:text-body-lg font-bold text-on-surface ${isCompleted ? 'line-through text-on-surface-variant/50' : ''}`}>{task.name}</h4>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && <span className="font-label-sm text-label-sm text-primary font-bold">+10 XP</span>}
                  <button onClick={(e) => handleDeleteTask(task._id, e)} className="p-1 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant hover:text-error cursor-pointer" title="Delete task">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">{getTaskDescription(task)}</p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-xs font-semibold uppercase tracking-wider">{task.type}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default SyllabusSection;
