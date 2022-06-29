import Button from "./Button";
// @ts-ignore
import styles from "./Controls.module.scss";

const Controls = ({
  handleAction,
  onBlankPress,
  onBlankLongPress,
  onFixPress,
  onFixLongPress,
  onConfirmPress,
  onConfirmLongPress,
}: any) => {
  return (
    <div className={styles.controls}>
      <Button
        onLongPress={onBlankLongPress}
        onClick={onBlankPress}
        type="white"
      >
        BRANCO
      </Button>
      <Button onLongPress={onFixLongPress} onClick={onFixPress} type="danger">
        CORRIGE
      </Button>
      <Button
        onLongPress={onConfirmLongPress}
        onClick={() => {
          if (handleAction) {
            handleAction(onConfirmPress());
            return;
          }
          onConfirmPress();
        }}
        type="action"
      >
        CONFIRMA
      </Button>
    </div>
  );
};

export default Controls;
