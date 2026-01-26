import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoading = (initialState: boolean = false): LoadingState => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
  };
};
