import { useState, useEffect, useRef } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);
  const durationsRef = useRef(durations);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isFirstPass = true;
    
    // @ts-ignore
    window.startRecording?.();
    
    function advanceScene(index: number) {
      setCurrentScene(index);
      
      const currentKey = sceneKeys[index];
      const duration = durationsRef.current[currentKey];
      
      timeoutId = setTimeout(() => {
        if (index === sceneKeys.length - 1) {
          if (isFirstPass) {
            // @ts-ignore
            window.stopRecording?.();
            isFirstPass = false;
          }
          advanceScene(0);
        } else {
          advanceScene(index + 1);
        }
      }, duration);
    }
    
    advanceScene(0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return { currentScene };
}
