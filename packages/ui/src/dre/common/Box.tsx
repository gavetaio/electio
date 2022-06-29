import React from "react";
// @ts-ignore
import styles from "./Box.module.scss";

const Box = React.forwardRef(({ children, className }: any, ref: any) => {
  const cls = [styles.container, "electio-sim"];

  if (className) {
    cls.push(className);
  }

  if (className)
    return (
      <div id="sim-urna" className={cls.join(" ")}>
        <div>
          <div ref={ref} className={styles.box}>
            {children}
          </div>
        </div>
      </div>
    );
});

export default Box;
