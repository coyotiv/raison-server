import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error.message.includes("Network Error") || error.message.includes("500")) {
          return failureCount < 3; // Retry up to 3 times for network errors or server errors
        }

        return false;
      },
    },
  },
});
