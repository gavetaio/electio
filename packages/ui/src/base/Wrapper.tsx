import React from 'react';
// @ts-ignore
import styles from './Wrapper.module.scss';

const Wrapper = ({ children, flexRow, padding }: any) => {
  const cls = [styles.container];
  if (flexRow) {
    cls.push(styles.flexRow);
  }

  if (padding) {
    cls.push(styles.padding);
  }

  return <div className={cls.join(' ')}>{children}</div>;
};

export default Wrapper;
