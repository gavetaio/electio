// @ts-ignore
import styles from "./Block.module.scss";

const Block = ({
  title,
  description,
  children,
  noMargin = false,
  marginDouble = false,
  noPadding = false,
  halfMargin = false,
  lighter = false,
  footer = null,
  darker = false,
  type = null,
}: any) => {
  const cls = [styles.container];

  if (noMargin) {
    cls.push(styles.noMargin);
  }

  if (marginDouble) {
    cls.push(styles.marginDouble);
  }

  if (halfMargin) {
    cls.push(styles.halfMargin);
  }

  if (noPadding) {
    cls.push(styles.noPadding);
  }

  if (lighter) {
    cls.push(styles.lighter);
  }

  if (darker) {
    cls.push(styles.darker);
  }

  if (type && styles[type]) {
    cls.push(styles[type]);
  }

  return (
    <div className={cls.join(" ")}>
      <header className={styles.header}>
        <small>{description}</small>
        {title && <h6>{title}</h6>}
      </header>
      <div className={styles.content}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
};

export default Block;
