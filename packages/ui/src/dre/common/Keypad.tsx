import { useRef, useEffect } from "react";
// @ts-ignore
import styles from "./Keypad.module.scss";
import Keyboard from "./Keyboard";
import Controls from "./Controls";
import Badge from "./Badge";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Keypad = ({
  onKeyPress,
  onFixPress,
  onFixLongPress,
  onBlankPress,
  onBlankLongPress,
  onConfirmLongPress,
  onConfirmPress,
  handleAction,
  badgeTitle = null,
}: any) => {
  const ref = useRef(null);

  const callEvent = (num) => {
    return new Promise((resolve) => {
      const buttons = ref.current.querySelectorAll("button");
      const ev = new CustomEvent("btnPress", { detail: { callback: resolve } });
      if (num === "CO") {
        buttons[12].dispatchEvent(ev);
        return;
      }
      if (num === "CR") {
        buttons[11].dispatchEvent(ev);
        return;
      }
      if (num === "BR") {
        buttons[10].dispatchEvent(ev);
        return;
      }
      if (num >= 0 && num < 10) {
        buttons[num - 1].dispatchEvent(ev);
      }
    });
  };

  useEffect(() => {
    //
    ref.current.addEventListener("bundlePress", async (event) => {
      if (!event?.detail?.value?.length) {
        return;
      }
      const { value, callback } = event.detail;
      if (!value?.length) {
        return;
      }

      for (let i = 0; i < value.length; i += 1) {
        await callEvent(value[i]);
        await sleep(375);
      }
    });
  }, []);

  return (
    <div
      ref={ref}
      className={["electio-keypad", styles.keypad, styles.carbon].join(" ")}
    >
      <Badge title={badgeTitle} />
      <Keyboard
        handleAction={handleAction}
        onKeyPress={onKeyPress}
        controls={() => {
          return (
            <Controls
              {...{
                onFixPress,
                onBlankPress,
                onBlankLongPress,
                onFixLongPress,
                onConfirmPress,
                handleAction,
                onConfirmLongPress,
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default Keypad;
