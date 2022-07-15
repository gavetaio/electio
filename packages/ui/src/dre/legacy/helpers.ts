import { getCargoDisplayTitle } from "../common/helpers";
import { forEachList } from "@gavetaio/core";

const LABEL_EXTRA = {
  suplente_1: "1º Suplente",
  suplente_2: "2º Suplente",
  vice_governador: "Vice-governador",
  vice_presidente: "Vice-presidente",
  vice_prefeito: "Vice-prefeito",
};

const getAlertState = ({
  isCompleto,
  isBranco,
  isNulo,
  isLegenda,
  hasLegenda,
  hasCandidato,
  typedThreshold,
}) => {
  const nulo = "Voto Nulo";
  const legenda = "Voto de Legenda";
  const branco = "Voto em Branco";

  if (isBranco) {
    return branco;
  }

  if (isCompleto && isLegenda) {
    return legenda;
  }

  if (isNulo && typedThreshold && hasLegenda) {
    return nulo;
  }

  if (isCompleto && !hasCandidato) {
    return nulo;
  }

  return null;
};

const getWarningMessage = ({
  isCompleto,
  isLegenda,
  hasCandidato,
  typedThreshold,
  hasPartido,
  hasLegenda,
}) => {
  const errado = "Número Errado";
  const inexistente = "Candidato Inexistente";

  if (isCompleto && isLegenda && !hasCandidato) {
    return inexistente;
  }

  if (isCompleto && !hasCandidato) {
    return errado;
  }

  if (typedThreshold && hasLegenda && !hasPartido) {
    return errado;
  }

  return null;
};

const getPartidoDisplay = ({ isCompleto, hasLegenda, isNulo, state }) => {
  if (isNulo) {
    return null;
  }
  const partido =
    (!isCompleto && hasLegenda) || isCompleto
      ? state.partido?.nome || null
      : null;

  return partido;
};

export const buildForm = ({
  numbers,
  placeholder = 0,
  legenda = false,
  nome = null,
  partido = null,
  warning,
  alert,
  blank = false,
  extra = [],
}: any) => {
  const result = {
    warning: null,
    form: [],
    extras: 0,
  };

  result.form.push({
    label: "Número",
    type: "input",
    visible: true,
    value: { numbers, placeholder },
  });

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

export const getVoteStatus = ({ state, current, numbers }: any) => {
  const result = {
    isCompleto: !!(numbers?.length && numbers.length === current.digitos),
    isNulo: false,
    isBranco: false,
    isLegenda: false,
    isNominal: false,
    hasCandidato: !!state?.candidato?.nome,
    hasPartido: !!state?.partido?.nome,
    hasLegenda: !!current.legenda,
    showInfo: false,
    threshold: numbers?.length >= 2,
  };

  if (state.blank) {
    result.isBranco = true;
    return result;
  }

  if (result.hasLegenda && result.threshold) {
    result.showInfo = true;
  }

  if (result.hasLegenda && result.hasPartido && !result.hasCandidato) {
    result.isLegenda = true;
  }

  if (result.hasLegenda && !result.hasPartido) {
    result.isNulo = true;
  }

  if (!result.hasLegenda && !result.hasCandidato) {
    result.isNulo = true;
  }

  if (result.isCompleto) {
    result.showInfo = true;
  }

  return result;
};

export const getTransformedResponse = ({ state, current, numbers }) => {
  const response: any = {
    title: getCargoDisplayTitle({ current, state }),
    thumbnails: {
      primary: null,
      secondary: [],
    },
  };

  const status = getVoteStatus({
    state,
    current,
    numbers,
  });

  const {
    isCompleto,
    isNulo,
    isBranco,
    isLegenda,
    hasLegenda,
    hasCandidato,
    hasPartido,
    showInfo,
  } = status;

  response.showInfo = showInfo;
  response.isBlank = isBranco;

  const nome = state.candidato?.nome;

  if (state?.candidato?.nome) {
    response.thumbnails.primary = {
      size: "large",
      shown: true,
      title: current?.label,
      src: state?.candidato?.image,
    };
  }

  if (state?.candidato?.extras) {
    forEachList(state.candidato.extras, (id, info) => {
      response.thumbnails.secondary.push({
        size: "medium",
        shown: true,
        title: LABEL_EXTRA[id],
        src: state?.candidato?.image || "default",
      });
    });
  }

  const typedThreshold = numbers?.length && numbers.length >= 2;

  const alert = getAlertState({
    isNulo,
    isLegenda,
    isBranco,
    isCompleto,
    typedThreshold,
    hasCandidato,
    hasLegenda,
  });

  const warning = getWarningMessage({
    isCompleto,
    isLegenda,
    hasCandidato,
    typedThreshold,
    hasLegenda,
    hasPartido,
  });

  const partidoDisplay = getPartidoDisplay({
    isCompleto,
    hasLegenda,
    isNulo,
    state,
  });

  const extra = [];

  if (state?.candidato?.extras) {
    forEachList(state.candidato.extras, (id, info) => {
      extra.push({ cargo: LABEL_EXTRA[id], nome: info });
    });
  } else if (current?.extras) {
    forEachList(current.extras, (id) => {
      extra.push(id); //
    });
  }

  response.formObject = buildForm({
    numbers,
    placeholder: current?.digitos || 0,
    nome,
    partido: partidoDisplay,
    alert,
    warning,
    legenda: current.legenda && state.partido?.nome && !state.candidato?.nome,
    blank: state?.blank,
    extra,
  });

  return response;
};
