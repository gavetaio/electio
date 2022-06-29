// @ts-ignore
import styles from './Page.module.scss';

const Page = ({ children }) => {
  const cls = [styles.container];

  return <div className={cls.join(' ')}>{children}</div>;
};

export default Page;
