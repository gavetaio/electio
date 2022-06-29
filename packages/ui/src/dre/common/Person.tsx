// @ts-ignore
import styles from "./Person.module.scss";

const Person = ({ className = null }) => {
  const cls = [styles.container];

  if (className) {
    cls.push(className);
  }

  return (
    <div className={cls.join(" ")}>
      <span />
      <span />
      <span />
    </div>
  );
};

export default Person;
