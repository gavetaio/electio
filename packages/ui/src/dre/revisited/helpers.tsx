import { getCargoDisplayTitle } from "../common/helpers";

const getVoteSubtitleHelper = ({
  stage,
  numbers,
  hasLegenda,
  hasCandidato,
  isNulo,
  isBranco,
}) => {
  if (isNulo || isBranco) {
    return <>Responda a pergunta abaixo</>;
  }

  if (stage === 0 || stage === 1) {
    if (hasLegenda && numbers.length <= 2) {
      return (
        <>
          Digite o número de seu <strong>candidato</strong> ou{" "}
          <strong>partido</strong>
        </>
      );
    }

    if (hasCandidato) {
      return <>Confira seu candidato</>;
    }

    if (numbers.length > 0) {
      return (
        <>
          Complete o número de seu <strong>candidato</strong>
        </>
      );
    }

    return (
      <>
        Digite o número de seu <strong>candidato</strong>
      </>
    );
  }

  return null;
};

const getVoteFooterHelper = ({
  stage,
  numbers,
  warning,
  isLegenda,
  hasLegenda,
  hasPartido,
  hasCandidato,
}) => {
  const result = { footer: null, warning: null, next: null };

  if (stage === 0 || stage === 1) {
    if (hasLegenda && numbers.length === 2) {
      if (warning) {
        result.warning = (
          <>
            Pressione{" "}
            <mark data-type="danger">
              <span>Corrige</span>
            </mark>{" "}
            e tente novamente
          </>
        );
        return result;
      }

      if (hasPartido && !isLegenda) {
        result.footer = (
          <>
            <mark data-type="confirm">
              <span>Confirma</span>
            </mark>{" "}
            caso queira votar somente na <strong>legenda</strong>
          </>
        );
        return result;
      }
    }

    if (hasCandidato || isLegenda) {
      result.next = true;
      return result;
    }

    if (warning) {
      result.warning = (
        <>
          Pressione{" "}
          <mark data-type="danger">
            <span>Corrige</span>
          </mark>{" "}
          e tente novamente
        </>
      );
      return result;
    }
  }

  return result;
};

const getFormData = ({
  isNulo,
  isLegenda,
  isBranco,
  warning,
  numbers,
  current,
  state,
}) => {
  const result = [];

  if (isNulo) {
    result.push({
      type: "question",
      value: {
        title: "Voto Nulo",
        question: (
          <>
            Você deseja <strong>anular seu voto</strong> para este cargo?
          </>
        ),
      },
    });
    return result;
  }

  if (isBranco) {
    result.push({
      type: "question",
      value: {
        title: "Voto Branco",
        question: "Você deseja votar em branco?",
      },
    });
    return result;
  }

  if (isLegenda) {
    result.push({
      type: "question",
      value: {
        title: state.partido.nome,
        question: "Você deseja votar na legenda?",
      },
    });
    return result;
  }

  if (warning || numbers.length < current.digitos) {
    result.push({
      type: "input",
      value: { numbers, placeholder: current?.digitos || 0, warning },
    });
  }

  if (!warning && numbers.length === current.digitos) {
    result.push({
      type: "candidato",
      value: {
        ...state.candidato,
        display: current?.label,
      },
    });
  }

  return result;
};

export const buildForm = ({
  cargo,
  numbers,
  placeholder = 0,
  legenda = false,
  nome = null,
  partido = null,
  warning,
  alert,
  blank = false,
  extra = [],
  stage = 0,
}: any) => {
  const result = {
    warning: null,
    form: [],
    extras: 0,
  };

  if (stage === 0 || stage === 1) {
    result.form.push({
      type: "title",
      visible: true,
      value: cargo,
    });
    result.form.push({
      label: "Número",
      type: "input",
      visible: true,
      value: { numbers, placeholder },
    });

    if (partido !== null) {
      result.form.push({
        label: "Partido",
        type: "text",
        visible: true,
        value: partido,
      });
    }

    return result;
  }

  if (stage === 2) {
    //
  }

  if (warning) {
    result.form.push({
      value: warning,
      type: "warning",
      visible: true,
    });
  }

  if (!warning && !blank) {
    result.form.push({
      label: "Nome",
      type: "text",
      visible: !!nome,
      value: nome,
    });
  }

  if (partido !== null) {
    result.form.push({
      label: "Partido",
      type: "text",
      visible: true,
      value: partido,
    });
  }

  if (alert) {
    if (legenda === true) {
      result.form.push({
        type: "alert",
        value: alert,
        visible: true,
        floating: true,
      });
    } else {
      result.form.push({
        type: "alert",
        value: alert,
        visible: true,
      });
    }
  }

  if (extra?.length) {
    result.extras = extra?.length;

    extra.forEach((data) => {
      if (typeof data === "string") {
        result.form.push({
          label: data,
          type: "small",
          visible: false,
          value: "",
        });
        return;
      }

      result.form.push({
        label: data.cargo,
        type: "small",
        visible: true,
        value: data.nome,
      });
    });
  }

  if (legenda && numbers.length !== placeholder) {
    result.warning = "voto de legenda";
  }

  return result;
};

export const getVoteStatus = ({ state, numbers }: any) => {
  const { current } = state;

  const result = {
    isCompleto: !!(
      numbers?.length &&
      numbers.length === current.digitos &&
      !state.warning
    ),
    isNulo: false,
    isBranco: false,
    isLegenda: false,
    isNominal: false,
    hasCandidato: !!state?.candidato?.nome,
    hasPartido: !!state?.partido?.nome,
    hasLegenda: !!current.legenda,
    threshold: numbers?.length >= 2,
  };

  if (state.branco) {
    result.isBranco = true;
    return result;
  }

  if (state.nulo) {
    result.isNulo = true;
    return result;
  }

  if (
    result.hasLegenda &&
    result.hasPartido &&
    !result.hasCandidato &&
    state.legenda
  ) {
    result.isLegenda = true;
  }

  return result;
};

export const getTransformedResponse = ({ state, numbers }) => {
  const { stage, warning, current } = state;
  const cargoTitle = getCargoDisplayTitle({ current, state });

  const status = getVoteStatus({
    state,
    numbers,
  });

  const { isNulo, isBranco, isLegenda, hasLegenda, hasCandidato, hasPartido } =
    status;

  const response: any = {
    title: cargoTitle,
    form: [],
  };

  const footerInfo = getVoteFooterHelper({
    stage,
    warning,
    isLegenda,
    numbers,
    hasLegenda,
    hasPartido,
    hasCandidato,
  });

  response.footer = footerInfo.footer;
  response.next = footerInfo.next;

  response.subtitle = getVoteSubtitleHelper({
    stage,
    numbers,
    hasLegenda,
    isNulo,
    isBranco,
    hasCandidato,
  });

  response.form = getFormData({
    isLegenda,
    isNulo,
    isBranco,
    warning,
    numbers,
    current,
    state,
  });

  if (isNulo || isBranco) {
    response.next = true;
  }

  response.isBlank = isBranco;
  response.isNull = isNulo;

  return response;
};
