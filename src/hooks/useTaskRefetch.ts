import { useEffect, useCallback } from "react";

const TASK_REFETCH_EVENT = "task:refetch";

export function useTaskRefetchTrigger() {
  const triggerRefetch = useCallback(() => {
    window.dispatchEvent(new CustomEvent(TASK_REFETCH_EVENT));
  }, []);

  return triggerRefetch;
}

export function useTaskRefetchListener(callback: () => void) {
  useEffect(() => {
    const handleRefetch = () => {
      callback();
    };

    window.addEventListener(TASK_REFETCH_EVENT, handleRefetch);

    return () => {
      window.removeEventListener(TASK_REFETCH_EVENT, handleRefetch);
    };
  }, [callback]);
}

export function triggerTaskRefetch() {
  window.dispatchEvent(new CustomEvent(TASK_REFETCH_EVENT));
}
