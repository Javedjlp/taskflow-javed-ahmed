import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../api/client";

export const useTaskSSE = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(`${API_BASE_URL}/events`);

    const handleEvent = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.projectId === projectId) {
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        }
      } catch {
        // Ignore parse errors from heartbeat events
      }
    };

    eventSource.addEventListener("task-created", handleEvent);
    eventSource.addEventListener("task-updated", handleEvent);
    eventSource.addEventListener("task-deleted", handleEvent);

    eventSource.onerror = () => {
      // Browser will auto-reconnect; nothing to do
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, queryClient]);
};
