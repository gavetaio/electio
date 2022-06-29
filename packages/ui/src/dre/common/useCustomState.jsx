import { useEffect, useRef, useState } from "react";
import { deepClone } from "@gavetaio/core";

export default function useCustomState(init, debounced = false) {
  const [state, setState] = useState(init);
  const callbackRef = useRef(null);
  const stateRef = useRef(init);
  const debouncedRef = useRef(null);

  const debouncedStateUpdate = () => {
    if (debouncedRef.current) {
      return;
    }

    debouncedRef.current = setTimeout(updateState, 115);
  };

  const setCustomState = (newState, callback = null, destroy = null) => {
    callbackRef.current = callback;

    if (Array.isArray(init)) {
      if (Array.isArray(newState)) {
        stateRef.current = newState;
      } else {
        stateRef.current.push(newState);
      }
    } else if (destroy) {
      stateRef.current = {
        ...init,
        ...newState,
      };
    } else {
      stateRef.current = deepClone({
        ...stateRef.current,
        ...newState,
      });
    }

    if (debounced) {
      debouncedStateUpdate();
    } else {
      updateState();
    }

    return stateRef.current;
  };

  const updateState = () => {
    setState(stateRef.current);
  };

  const resetState = (data = {}, callback) => {
    setCustomState({ ...init, ...data }, callback, true);
  };

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state);
    }

    callbackRef.current = undefined;
  }, [state]);

  return [state, setCustomState, resetState, stateRef];
}
