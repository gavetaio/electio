// @ts-ignore
import styles from "./Logo.module.scss";

export default function Logo({ canClip = true, circled = false }: any) {
  const cls = [styles.container];

  if (!canClip) {
    cls.push(styles.noclip);
  }

  if (circled) {
    cls.push(styles.circled);
  }

  return (
    <div className={cls.join(" ")}>
      <div>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
