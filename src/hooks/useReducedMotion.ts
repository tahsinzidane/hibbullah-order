import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled?.().then((enabled) => {
      if (mounted) setReduced(enabled);
    });

    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      setReduced(enabled);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

export default useReducedMotion;