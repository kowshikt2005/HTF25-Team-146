import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { apiService } from '../lib/api';

interface OptimisticUpdate<T> {
  id: string;
  originalData: T;
  optimisticData: T;
  timestamp: number;
}

export const useOptimisticUpdates = () => {
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<any>[]>([]);
  const { updateTask, addNotification } = useAppStore();

  const optimisticTaskUpdate = async (
    taskId: string, 
    updates: any, 
    originalTask: any
  ) => {
    const updateId = `${taskId}-${Date.now()}`;
    
    // Add to pending updates
    const optimisticUpdate: OptimisticUpdate<any> = {
      id: updateId,
      originalData: originalTask,
      optimisticData: { ...originalTask, ...updates },
      timestamp: Date.now()
    };
    
    setPendingUpdates(prev => [...prev, optimisticUpdate]);
    
    // Apply optimistic update immediately
    updateTask(taskId, updates);
    
    try {
      // Make API call
      await apiService.updateTask(taskId, updates);
      
      // Remove from pending updates on success
      setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      
      addNotification({
        type: 'success',
        message: 'Task updated successfully'
      });
      
    } catch (error) {
      // Rollback on error
      updateTask(taskId, originalTask);
      
      // Remove from pending updates
      setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      
      addNotification({
        type: 'error',
        message: 'Failed to update task. Changes reverted.'
      });
      
      console.error('Optimistic update failed:', error);
    }
  };

  const rollbackUpdate = (updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (update) {
      // Rollback to original data
      updateTask(update.originalData._id, update.originalData);
      
      // Remove from pending
      setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
    }
  };

  const isPending = (taskId: string) => {
    return pendingUpdates.some(u => u.originalData._id === taskId);
  };

  return {
    optimisticTaskUpdate,
    rollbackUpdate,
    isPending,
    pendingUpdates,
  };
};