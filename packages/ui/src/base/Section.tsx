// @ts-ignore
import styles from "./Section.module.scss";

const Section = ({ title, description, type = null, children = null }: any) => {
  const cls = [styles.container];

  if (type) {
    cls.push(styles[type]);
  }

  if (type) {
    cls.push(styles[type]);
  }

  const renderTitle = () => {
    if (!title) {
      return null;
    }
    if (type === "main") {
      return <h2>{title}</h2>;
    }
    if (type === "small") {
      return <h5>{title}</h5>;
    }

    return <h4>{title}</h4>;
  };

  const renderedTitle = renderTitle();

  return (
    <section className={styles.container}>
      {renderedTitle && (
        <header className={styles.header}>{renderedTitle}</header>
      )}
      <div className={styles.content}>
        {description && <blockquote>{description}</blockquote>}
        {children}
      </div>
    </section>
  );
};

export default Section;
