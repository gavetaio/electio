// @ts-ignore
import styles from "./Font.module.scss";

const Font = ({
  children,
  name,
  type = "body",
  weight = "400",
  caps = false,
  bold = false,
  thin = false,
}: any) => {
  const cls = [styles.font];
  const style = {
    "--font-size": `var(--font-${name})`,
    "--font-weight": weight,
  } as React.CSSProperties;

  if (caps) {
    cls.push(styles.caps);
  }

  if (bold) {
    cls.push(styles.bold);
  }

  if (thin) {
    cls.push(styles.thin);
  }

  if (type === "body") {
    return (
      <p style={style} className={cls.join(" ")}>
        {children}
      </p>
    );
  }

  if (type === "label") {
    return (
      <label style={style} className={cls.join(" ")}>
        {children}
      </label>
    );
  }

  return (
    <h2 style={style} className={cls.join(" ")}>
      {children}
    </h2>
  );
};

export default Font;
