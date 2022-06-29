// @ts-ignore
import styles from "./Components.module.scss";
import { forEachList } from "@gavetaio/core";
import { getPartidoData } from "@gavetaio/engine/src/data/partidos";

import { Font, Image, Person } from "../common";

export const Invalid = ({ type }) => {
  return (
    <div
      className={[styles.thumb_invalid, styles[`thumb_${type}`]].join(" ")}
    />
  );
};

export const Thumb = (props: any) => {
  const { title, size = "large", type } = props;
  const cls = [styles.thumb, styles[`thumb_${size}`]];
  const renderImage = () => {
    if (type === "legenda") {
      return <Image color="blue" className={styles.thumb_legenda} />;
    }
    if (type === "nulo" || type === "branco") {
      return <Invalid type={type} />;
    }
    return <Person className={styles.thumb_image} />;
  };

  return (
    <div className={cls.join(" ")}>
      <div>
        {renderImage()}
        {title && (
          <div>
            <Font type="body" name="micro" caps>
              {title}
            </Font>
          </div>
        )}
      </div>
    </div>
  );
};

export const Input = ({ children, cursor }: any) => {
  const cls = [styles.input];

  if (!children) {
    cls.push(styles.input_light);
  }

  if (cursor) {
    cls.push(styles.input_cursor);
  }

  return (
    <div className={cls.join(" ")}>
      <Font type="body" name="input" weight="500">
        {children}
      </Font>
    </div>
  );
};

export const Inputs = ({ placeholder, numbers, warning }: any) => {
  const renderInputs = () => {
    const result = [];
    for (let i = 0; i < placeholder; i += 1) {
      const number = numbers?.[i] || "";
      result.push(
        <Input
          cursor={warning ? i === numbers.length - 1 : i === numbers.length}
        >
          {number}
        </Input>
      );
    }
    return result;
  };

  return <div className={styles.inputs}>{renderInputs()}</div>;
};

const VoteQuestion = ({ title, question }: any) => {
  return (
    <div className={styles.question}>
      <Font name="h0" type="title" weight="800" caps>
        {title}
      </Font>
      <Font type="body" name="medium" weight="400" caps>
        {question}
      </Font>
    </div>
  );
};

const getLineRendered = ({ value, type }) => {
  const result = {
    renderedClass: [],
    rendered: null,
  };

  if (type === "candidato") {
    result.rendered = <VoteBox {...value} />;
    return result;
  }

  if (type === "input") {
    result.rendered = <Inputs {...value} />;
    return result;
  }

  if (type === "question") {
    result.rendered = <VoteQuestion {...value} />;
    return result;
  }

  if (type === "title") {
    result.rendered = (
      <Font name="h1" type="title" weight="600">
        {value}
      </Font>
    );
    return result;
  }

  if (type === "alert") {
    result.renderedClass.push(styles.alert);
    result.rendered = (
      <Font type="body" name="alert" weight="300">
        {value}
      </Font>
    );
    return result;
  }

  if (type === "warning") {
    result.renderedClass.push(styles.warning);
    result.rendered = (
      <Font type="body" name="line">
        {value}
      </Font>
    );
    return result;
  }

  if (type === "small") {
    result.rendered = (
      <Font type="body" name="label">
        {value}
      </Font>
    );
    return result;
  }

  result.rendered = (
    <Font type="body" name="line">
      {value}
    </Font>
  );

  return result;
};

export const Line = (props: any) => {
  const { visible = true, value, type, floating = false } = props;
  const cls = [styles.line, styles[`line__${type}`]];

  if (!visible) {
    cls.push(styles.hidden);
  }

  if (floating === true) {
    cls.push(styles.floating);
  }

  const { rendered, renderedClass }: any = getLineRendered({ value, type });

  if (renderedClass) {
    cls.push(renderedClass);
  }

  return <div className={cls.join(" ")}>{rendered}</div>;
};

const SUBTITLE = {
  senador: "Suplentes",
  governador: "Vice-governador",
  presidente: "Vice-presidente",
  prefeito: "Vice-prefeito",
};

export const VoteBoxSmall = (props: any) => {
  const cls = [styles.voto, styles.small];
  const { nome, numero, image, partido, display = null, type } = props;
  const partidoInfo = getPartidoData(partido);

  return (
    <div className={cls.join(" ")}>
      <div>
        <Thumb size="small" src={image} type={type} />
      </div>
      <div className={styles.voto__content}>
        <div className={styles.voto__info}>
          <div className={styles.voto__number}>
            <Font type="body" name="micro" caps>
              {display}
            </Font>
          </div>
          <div className={styles.voto__candidate}>
            <Font type="body" name="small" bold>
              {nome.toUpperCase()}
            </Font>
          </div>
          <div className={styles.voto__extra}>
            <Font type="body" name="micro" thin>
              {partidoInfo?.sigla} — {numero}
            </Font>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VoteBox = (props: any) => {
  const { cargo, nome, numero, image, partido, extras, display = null } = props;

  const partidoInfo = getPartidoData(partido);
  const cls = [styles.voto];

  const renderExtras = () => {
    if (!extras) {
      return null;
    }

    const subtitle = SUBTITLE[cargo];

    const list = [];
    forEachList(extras, (extra, info) => {
      list.push(info);
    });

    return (
      <>
        <div className={styles.voto__extra}>
          <Font type="body" name="micro" caps weight="600">
            {subtitle}
          </Font>
          {list.map((extra) => (
            <Font type="body" name="tiny" weight="300">
              {extra}
            </Font>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={cls.join(" ")}>
      <div>
        <Thumb size="large" src={image} title={display} />
      </div>
      <div className={styles.voto__content}>
        <div className={styles.voto__info}>
          <div className={styles.voto__number}>
            <Font name="h1" type="title" bold>
              {numero}
            </Font>
          </div>
          <div className={styles.voto__candidate}>
            <Font name="h3" type="title" weight="500">
              {nome}
            </Font>
            <Font type="body" name="small" thin caps>
              {partidoInfo?.sigla || partido}
            </Font>
          </div>
        </div>
        {renderExtras()}
      </div>
    </div>
  );
};
