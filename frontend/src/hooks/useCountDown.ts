import { useState, useRef, useCallback } from "react";

const useCountDown = (initialSeconds: number, callback?: () => void) => {
  const [countDown, setCountDown] = useState(initialSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCountDown = useCallback(() => {
    return new Promise<void>((resolve) => {
      setCountDown(initialSeconds);
      setIsFinished(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setCountDown((prevCountDown) => {
          if (prevCountDown <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsFinished(true);
            if (callback && typeof callback === "function") {
              callback();
            }
            resolve();
            return 0;
          }
          return prevCountDown - 1;
        });
      }, 1000);
    });
  }, [initialSeconds, callback]);

  const clearCountDown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCountDown(initialSeconds);
    setIsFinished(false);
  }, [initialSeconds]);

  return { countDown, startCountDown, clearCountDown, isFinished };
};

export default useCountDown;
