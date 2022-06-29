// @ts-ignore
import styles from './Spacer.module.scss';

const Spacer = ({ title }: any) => {
  const cls = [styles.container];

  return (
    <div className={cls.join(' ')}>
      <hr />
      {title && <h6>{title}</h6>}
      <hr />
    </div>
  );
};

export default Spacer;
