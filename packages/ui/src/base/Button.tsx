// @ts-ignore
import styles from "./Button.module.scss";
import ElevatedPressable from "./ElevatedPressable";
import { useCallback } from "react";

const Button = ({
  className,
  type = "primary",
  icon,
  id = null,
  iconPosition = "right",
  element = null,
  label,
  children,
  ref,
  transform = false,
  size = "medium",
  attrs = {},
  ...extra
}: any) => {
  let content = label || children;
  let wrapper = null;
  const cls = [styles.container];

  if (className) {
    cls.push(className);
  }

  wrapper = (
    <span className={styles.content}>
      <span className={styles.text}>{content}</span>
    </span>
  );

  if (type) {
    cls.push(styles[type]);
  }

  if (size) {
    cls.push(styles[size]);
  }

  if (extra.disabled) {
    cls.push(styles.disabled);
  }

  const handleClick = useCallback(
    (ev) => {
      if (extra.disabled || !extra.onClick) {
        return false;
      }
      extra.onClick(ev);
    },
    [extra.onClick, extra.disabled]
  );

  const handleLongClick = useCallback(() => {}, [
    extra.onLongPress,
    extra.disabled,
  ]);

  const handlePressDown = () => {
    if (extra.onPress) {
      extra.onPress();
    }
  };

  const handlePressRelease = () => {
    if (extra.onRelease) {
      extra.onRelease();
    }
  };

  return (
    <ElevatedPressable
      element={element}
      className={cls.join(" ")}
      onClick={handleClick}
      onLongPress={handleLongClick}
      onPress={handlePressDown}
      onRelease={handlePressRelease}
      disabled={extra.disabled}
      attrs={attrs}
    >
      {wrapper}
    </ElevatedPressable>
  );
};

export default Button;
