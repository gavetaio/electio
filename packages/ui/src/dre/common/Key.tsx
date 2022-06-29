import { useCallback, useState, useEffect, useRef } from "react";
import Font from "./Font";
import { Elevation } from "../../base";
// @ts-ignore
import styles from "./Key.module.scss";

const Key = ({ children, onClick }: any) => {
  const [pressed, setPressed] = useState(false);
  const ref: any = useRef();

  const press = useCallback(() => {
    return !pressed && setPressed(true);
  }, [pressed]);

  const release = useCallback(() => {
    return pressed && setPressed(false);
  }, [pressed]);

  const action = useCallback(() => {
    onClick(children);
    release();
  }, [release, children]);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("btnPress", (event) => {
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
      });
    }
  }, []);

  return (
    <button
      ref={ref}
      onTouchStart={press}
      onTouchEnd={release}
      onMouseDown={press}
      onMouseUp={release}
      onMouseOut={release}
      onBlur={release}
      onClick={action}
      className={styles.key}
    >
      <Elevation
        caseColor="var(--color-key)"
        darkColor="#0a0a0a"
        pressed={pressed}
      >
        <Font type="body" name="key" weight="300">
          {children}
        </Font>
      </Elevation>
    </button>
  );
};

export default Key;
