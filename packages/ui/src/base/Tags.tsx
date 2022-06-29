/* eslint-disable react/destructuring-assignment */
// @ts-ignore
import styles from './Tags.module.scss';

export const Tag = ({ label, type, number = null }: any) => {
  const cls = [];
  if (type) {
    cls.push(styles[type]);
  }
  return (
    <li className={cls.join(' ')}>
      {number !== null && <small className={styles.number}>{number}</small>}
      <small>{label}</small>
    </li>
  );
};

const Tags = ({ items }: any) => {
  return (
    <ul className={styles.container}>
      {items?.length &&
        items.map((item) => {
          return <Tag {...item} />;
        })}
    </ul>
  );
};

export default Tags;
