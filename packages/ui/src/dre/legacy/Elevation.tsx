import { CSSProperties } from "react";
// @ts-ignore
import styles from "./Elevation.module.scss";

const Elevation = ({
  children,
  caseColor,
  darkColor,
  pressed = false,
}: any) => {
  const style = {
    "--elevation-bg-case": caseColor,
    "--elevation-bg-dark": darkColor,
    "--elevation-state": pressed ? "0.75" : "0",
  } as CSSProperties;

  const cls = [styles.container];

  if (pressed) {
    cls.push(styles.pressed);
  }

  return (
    <div className={cls.join(" ")} style={style}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Elevation;
