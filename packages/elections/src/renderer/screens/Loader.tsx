import React, { useContext } from 'react';
import { LayoutContext } from 'renderer/context/layout';
import styles from './Loader.module.scss';
import { Loader } from '@gavetaio/ui';

const LoaderScreen = () => {
  const { getLayout }: any = useContext(LayoutContext);
  const { loader } = getLayout();

  if (!loader?.visible) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Loader />
        <h3>{loader.title}</h3>
        <small>{loader.text}</small>
      </div>
    </div>
  );
};

export default LoaderScreen;
