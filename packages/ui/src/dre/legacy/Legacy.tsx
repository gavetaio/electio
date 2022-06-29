import { useEffect, useRef, useState } from "react";
import { Line, Thumb, Title } from "./Base";
import { Font, Screen, Keypad, Box } from "../common";
// @ts-ignore
import styles from "./Legacy.module.scss";

export const Thumbnails = ({ thumbnails = {} }: any) => {
  const { primary = {}, secondary = [] } = thumbnails;
  if (!primary?.src) {
    return null;
  }

  return (
    <div className={styles.thumbnails}>
      <Thumb {...primary} />
      {secondary?.length ? (
        <div className={styles.thumb_secondary}>
          {secondary.map((item) => (
            <Thumb {...item} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const Footer = ({ warning }: any) => {
  return (
    <footer className={styles.footer}>
      <div>
        <Font name="footer">Aperte a tecla:</Font>
        <Font name="footer">CONFIRMA&nbsp;</Font>
        <Font name="footer">CORRIGE&nbsp;</Font>
      </div>
      <div>
        <Font name="footer">
          <span className={styles.hidden}>_</span>
        </Font>
        <Font name="footer">para CONFIRMAR este voto</Font>
        <Font name="footer">para REINICIAR este voto</Font>
      </div>
      <div>{warning && <Font name="footer">({warning})</Font>}</div>
    </footer>
  );
};

export const Header = ({ children = null, hidden = false }: any) => {
  const cls = [styles.header];

  if (hidden) {
    cls.push(styles.hidden);
  }

  return (
    <div className={cls.join(" ")}>
      <Font type="title" name="header">
        {children}
      </Font>
    </div>
  );
};

export const Form = ({ list = [] }: any) => {
  const result = [];
  const cls = [styles.form];

  list.forEach((item, index) => {
    result.push(<Line key={`${item.label}-${index}`} {...item} />);
  });

  return <div className={cls.join(" ")}>{result}</div>;
};

const Content = ({
  title = "Deputado Federal",
  formObject,
  showInfo,
  isBlank,
}: any) => {
  const content = [styles.content];
  const main = [styles.content__main];

  if (formObject?.extras) {
    main.push(styles[`extra_${formObject.extras}`]);
  }

  if (!showInfo && !isBlank) {
    content.push(styles.content_hidden);
  }

  if (isBlank) {
    content.push(styles.content_blank);
  }

  return (
    <div className={content.join(" ")}>
      <Header>Seu voto para</Header>
      <div className={main.join(" ")}>
        <Title>{title}</Title>
        <Form list={formObject?.form} />
      </div>
      <Footer warning={formObject.warning} />
    </div>
  );
};

export const EndScreen = () => {
  const bar = useRef(null);
  const [state, setState] = useState(1);
  const [percentage, setPercentage] = useState(25);
  const timer = useRef({
    initial: null,
    final: null,
  });

  useEffect(() => {
    const timerInitial = setTimeout(() => {
      setPercentage(75);
    }, 300);
    const timerFinal = setTimeout(() => {
      setState(2);
    }, 750);

    return () => {
      clearTimeout(timerInitial);
      clearTimeout(timerFinal);
    };
  }, [timer]);

  return (
    <div className={styles.end}>
      {state !== 1 ? (
        <div>
          <Font type="title" name="end">
            FIM
          </Font>
        </div>
      ) : (
        <div className={styles.progress}>
          <div
            ref={bar}
            className={[styles.bar, styles[`bar_${percentage}`]].join(" ")}
          >
            <Font type="body" name="bar" weight="400">
              {percentage}%
            </Font>
          </div>
          <Font type="body" name="progress" weight="600">
            Gravando
          </Font>
        </div>
      )}
    </div>
  );
};

export const LegacyScreen = (props: any) => {
  const { finished } = props;

  return (
    <Screen>
      {!finished ? (
        <>
          <Content {...props} />
          <Thumbnails {...props} />
        </>
      ) : (
        <EndScreen />
      )}
    </Screen>
  );
};

export const LegacyBox = (props: any) => {
  return (
    <Box className={styles.boxContainer}>
      <LegacyScreen {...props} />
      <Keypad badgeTitle="URNA ATUAL" {...props} />
    </Box>
  );
};
