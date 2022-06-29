import { ElevatedPressable } from "../../base";
import Font from "./Font";
// @ts-ignore
import styles from "./Button.module.scss";

const Button = ({ onLongPress, onClick, type = "white", children }: any) => {
  const cls = [styles.button, styles[type]];

  return (
    <ElevatedPressable
      onLongPress={onLongPress}
      onClick={onClick}
      className={cls.join(" ")}
    >
      <Font name="button" weight="400">
        {children}
      </Font>
    </ElevatedPressable>
  );
};

export default Button;
