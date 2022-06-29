// @ts-ignore
import styles from "./Keyboard.module.scss";
import Key from "./Key";
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const Keyboard = ({ onKeyPress, controls, handleAction = null }: any) => {
  const onKeyPressHandler = (number) => {
    if (!handleAction) {
      onKeyPress(number);
      return;
    }

    handleAction(onKeyPress(number));
  };

  return (
    <div className={[styles.keyboard, styles.carbon].join(" ")}>
      <div>
        {KEYS.map((key) => (
          <Key key={`keyboard-${key}`} onClick={onKeyPressHandler}>
            {key}
          </Key>
        ))}
      </div>
      {controls()}
    </div>
  );
};

export default Keyboard;
