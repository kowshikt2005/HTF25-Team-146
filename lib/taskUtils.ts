import { Task } from '../types/task';

// Utility function to add backward compatibility for assignedTo
export function addBackwardCompatibility(task: any): Task {
  return {
    ...task,
    // Add assignedTo as the first assignee for backward compatibility
    assignedTo: task.assignees && task.assignees.length > 0 ? task.assignees[0] : undefined
  };
}

// Utility function to process tasks array
export function processTasksForCompatibility(tasks: any[]): Task[] {
  return tasks.map(addBackwardCompatibility);
}