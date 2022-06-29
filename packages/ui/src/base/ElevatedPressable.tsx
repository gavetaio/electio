import { useState, useRef, useCallback, useEffect } from "react";
import Elevation from "./Elevation";

const ElevatedPressable = ({
  onClick = () => null,
  onLongPress = () => null,
  children,
  attrs = {},
  ...extra
}: any) => {
  const [pressed, setPressed] = useState(false);
  const ref = useRef(null);
  const time = useRef({
    timer: null,
    pressed: false,
  });

  const longPress = useCallback(() => {
    time.current.pressed = true;
    onLongPress();
  }, [onLongPress]);

  const press = useCallback(() => {
    time.current.pressed = false;
    time.current.timer = setTimeout(longPress, 5000);
    return !pressed && setPressed(true);
  }, [pressed, longPress]);

  const release = useCallback(() => {
    clearTimeout(time.current.timer);
    return pressed && setPressed(false);
  }, [pressed]);

  const action = useCallback(
    (event) => {
      if (time.current.pressed) {
        release();
        return;
      }
      onClick(event);
      release();
    },
    [release]
  );

  const emulateTrigger = (event) => {
    setPressed(true);
    setTimeout(() => {
      onClick(children);
      setPressed(false);
      if (event?.detail?.callback) {
        requestAnimationFrame(() => {
          event.detail.callback();
        });
      }
    }, 325);
  };

  useEffect(() => {
    if (ref?.current) {
      ref.current.addEventListener("btnPress", emulateTrigger);
    }
  }, []);

  return (
    <button
      ref={ref}
      onTouchStart={press}
      onTouchEnd={release}
      onTouchLeave={release}
      onTouchCancel={release}
      onMouseDown={press}
      onMouseUp={release}
      onMouseOut={release}
      onBlur={release}
      onClick={action}
      {...extra}
      {...attrs}
    >
      <Elevation
        caseColor="var(--color-key)"
        darkColor="#0a0a0a"
        pressed={pressed}
      >
        {children}
      </Elevation>
    </button>
  );
};

export default ElevatedPressable;
