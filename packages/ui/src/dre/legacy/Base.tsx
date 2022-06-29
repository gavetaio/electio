/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
import { useCallback, useState } from "react";
// @ts-ignore
import styles from "./Base.module.scss";
import { Logo, Elevation } from "@gavetaio/ui";
import { Image } from "../common";

export const Font = ({
  children,
  name,
  type = "body",
  weight = "400",
}: any) => {
  const cls = [styles.font];
  const style = {
    "--font-size": `var(--font-${name})`,
    "--font-weight": weight,
  } as React.CSSProperties;

  if (type === "body") {
    return (
      <p style={style} className={cls.join(" ")}>
        {children}
      </p>
    );
  }

  if (type === "label") {
    return (
      <label style={style} className={cls.join(" ")}>
        {children}
      </label>
    );
  }

  return (
    <h2 style={style} className={cls.join(" ")}>
      {children}
    </h2>
  );
};

export const ElevatedPressable = ({
  onClick = () => null,
  children,
  ...extra
}: any) => {
  const [pressed, setPressed] = useState(false);

  const press = useCallback(() => {
    return !pressed && setPressed(true);
  }, [pressed]);

  const release = useCallback(() => {
    return pressed && setPressed(false);
  }, [pressed]);

  const action = useCallback(
    (event) => {
      onClick(event);
      release();
    },
    [release]
  );

  return (
    <button
      onTouchStart={press}
      onTouchEnd={release}
      onMouseDown={press}
      onMouseUp={release}
      onMouseOut={release}
      onBlur={release}
      onClick={action}
      {...extra}
    >
      <Elevation
        caseColor="var(--color-key)"
        darkColor="#0a0a0a"
        pressed={pressed}
      >
        {children}
      </Elevation>
    </button>
  );
};

export const Thumb = (props: any) => {
  const { shown = true, src, title, size = "large" } = props;

  const cls = [styles.thumb, styles[`thumb_${size}`]];

  if (!shown) {
    cls.push(styles.hidden);
  }

  return (
    <div className={cls.join(" ")}>
      <div>
        <Image color="red" />
        {title && (
          <Font type="body" name={`thumb-${size}`}>
            {title}
          </Font>
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
      <Font type="body" weight="400" name="input">
        {children}
      </Font>
    </div>
  );
};

export const Inputs = ({ placeholder, numbers }: any) => {
  const renderInputs = () => {
    const result = [];
    for (let i = 0; i < placeholder; i += 1) {
      const number = numbers?.[i] || "";
      result.push(<Input cursor={i === numbers.length}>{number}</Input>);
    }
    return result;
  };

  return <div className={styles.inputs}>{renderInputs()}</div>;
};

export const Hr = ({ hidden = false }: any) => {
  const cls = [styles.hr];

  if (hidden) {
    cls.push(styles.hidden);
  }

  return <hr className={cls.join(" ")} />;
};

export const Spacer = () => <div className={styles.spacer} />;

export const Badge = () => (
  <div className={styles.badge}>
    <div>
      <Logo circled />
    </div>
    <div>
      <Font type="title" name="logo">
        Votação Simulada
      </Font>
      <Font type="title" name="caption">
        por @gavetaio
      </Font>
    </div>
  </div>
);

export const Title = ({ children = null }: any) => {
  return (
    <div className={styles.title}>
      <Font type="title" name="title">
        {children}
      </Font>
    </div>
  );
};

const getLineRendered = ({ value, type }) => {
  const result = {
    renderedClass: [],
    rendered: null,
  };

  if (type === "input") {
    result.rendered = <Inputs {...value} />;
    return result;
  }

  if (type === "alert") {
    result.renderedClass.push(styles.alert);
    result.rendered = (
      <Font name="alert" type="body">
        {value}
      </Font>
    );
    return result;
  }

  if (type === "warning") {
    result.renderedClass.push(styles.warning);
    result.rendered = (
      <Font name="line" type="body">
        {value}
      </Font>
    );
    return result;
  }

  if (type === "small") {
    result.rendered = (
      <Font name="label" type="body">
        {value}
      </Font>
    );
    return result;
  }

  result.rendered = (
    <Font name="line" type="body">
      {value}
    </Font>
  );

  return result;
};

export const Line = (props: any) => {
  const { visible = true, label, value, type, floating = false } = props;
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

  return (
    <div className={cls.join(" ")}>
      {label && (
        <div>
          <Font name="label" type="label">
            {label}:
          </Font>
        </div>
      )}
      <div>{rendered}</div>
    </div>
  );
};
