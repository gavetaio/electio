import { useEffect, useRef, useState } from "react";
import { Line, Thumb, VoteBoxSmall } from "./Components";
import { Font, Screen, Box, Keypad } from "../common";
// @ts-ignore
import styles from "./Revisited.module.scss";
import { onTransitionEnd } from "../../base/helpers";

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

const Boolean = () => {
  return (
    <footer className={[styles.footer, styles.boolean].join(" ")}>
      <Font type="body" name="medium" caps>
        Pressione <mark>1</mark> para{" "}
        <strong>
          <u>SIM</u>
        </strong>
      </Font>
      <Font type="body" name="medium" caps>
        ou
      </Font>
      <Font type="body" name="medium" caps>
        Pressione <mark>3</mark> para{" "}
        <strong>
          <u>NÃO</u>
        </strong>
      </Font>
    </footer>
  );
};

const NumeroIncompleto = () => {
  return (
    <footer className={[styles.footer].join(" ")}>
      <Font type="body" name="medium" caps>
        <strong>Atenção!</strong> Complete o número de seu candidato
      </Font>
    </footer>
  );
};

const NumeroInvalido = ({ warning }) => {
  const text = warning === 1 ? "Número Inválido" : "Candidato já foi votado";

  return (
    <footer className={[styles.footer, styles.confirm].join(" ")}>
      <Font type="body" name="medium" caps>
        <strong>Atenção!</strong> {text}
      </Font>
      <Font type="body" name="medium" caps>
        Pressione{" "}
        <mark data-type="danger">
          <span>Corrige</span>
        </mark>{" "}
        para alterar
      </Font>
    </footer>
  );
};

const Next = () => {
  return (
    <footer className={[styles.footer, styles.confirm].join(" ")}>
      <Font type="body" name="micro" caps>
        <mark data-type="danger">
          <span>Corrige</span>
        </mark>{" "}
        para alterar
      </Font>
      <Font type="body" name="medium" caps>
        <mark data-type="confirm">
          <span>Confirma</span>
        </mark>{" "}
        para continuar →
      </Font>
    </footer>
  );
};

const Restarted = () => {
  return (
    <footer className={styles.footer}>
      <Font type="body" name="medium" caps>
        <strong>Atenção!</strong> Você optou por{" "}
        <strong>
          <u>reiniciar</u>
        </strong>{" "}
        seu voto
      </Font>
    </footer>
  );
};

const End = () => {
  return (
    <footer className={[styles.footer, styles.confirm].join(" ")}>
      <Font type="body" name="micro" caps>
        <mark data-type="danger">
          <span>Corrige</span>
        </mark>{" "}
        por <b>5 segundos</b> para refazer
      </Font>
      <Font type="body" name="medium" caps>
        <mark data-type="confirm">
          <span>Confirma</span>
        </mark>{" "}
        para finalizar
      </Font>
    </footer>
  );
};

export const Footer = ({ children, extra = "" }: any) => {
  return (
    <footer className={styles.footer}>
      <Font type="body" name="tiny" caps>
        {children}
      </Font>
      {extra && (
        <Font type="body" name="micro" caps>
          {extra}
        </Font>
      )}
    </footer>
  );
};

export const Header = ({ children = null, subtitle = "" }: any) => {
  const cls = [styles.header];

  return (
    <div className={cls.join(" ")}>
      <Font type="title" name="h2" bold caps>
        {children}
      </Font>
      <Font type="body" name="tiny" caps>
        {subtitle}
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
  title,
  subtitle,
  form,
  footer,
  warning,
  incomplete,
  restarted,
  boolean,
  next,
}: any) => {
  const content = [styles.content];
  const main = [styles.content__main];

  const renderFooter = () => {
    if (next) {
      return <Next />;
    }

    if (boolean) {
      return <Boolean />;
    }

    if (warning) {
      return <NumeroInvalido warning={warning} />;
    }

    if (incomplete) {
      return <NumeroIncompleto />;
    }

    if (restarted) {
      return <Restarted />;
    }

    return <Footer>{footer}</Footer>;
  };

  return (
    <div className={content.join(" ")}>
      <Header subtitle={subtitle}>{title}</Header>
      <div className={main.join(" ")}>
        <Form list={form} />
      </div>
      {renderFooter()}
    </div>
  );
};

export const ReviewScreen = (props: any) => {
  const { votos } = props;

  const renderVotos = () => {
    if (!votos?.length) {
      return null;
    }
    return votos.map((voto) => <VoteBoxSmall {...voto} />);
  };

  return (
    <div className={[styles.content, styles.review].join(" ")}>
      <Header subtitle="Confira suas escolhas e finalize a votação">
        Confirmação de Voto
      </Header>
      <section>{renderVotos()}</section>
      <End />
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

export const RevisitedScreen = (props: any) => {
  const { finished, review } = props;
  const renderScreen = () => {
    if (finished) {
      return <EndScreen />;
    }
    if (review) {
      return <ReviewScreen {...props} />;
    }

    return <Content {...props} />;
  };
  return <Screen>{renderScreen()}</Screen>;
};

export const RevisitedBox = (props: any) => {
  const div = useRef(null);
  const handleAction = (result) => {
    if (result === true) {
      return;
    }

    let cls = "blink";

    if (typeof result === "string") {
      cls = `blink-${result}`;
    }
    const screen = div.current.querySelector("div");

    screen.classList.add(styles[cls]);
    onTransitionEnd(screen).then(() => {
      screen.classList.remove(styles[cls]);
    });
  };

  return (
    <Box ref={div} className={styles.revisited}>
      <RevisitedScreen {...props} />
      <Keypad
        badgeTitle="Urna Corrigida"
        handleAction={handleAction}
        {...props}
      />
    </Box>
  );
};
