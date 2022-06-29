const match = (when, list, and) => {
  let result = 0;
  list.forEach((item) => {
    if (when.match(item)) {
      result += 1;
    }
  });
  return and ? result === list.length : result > 0;
};

const or = (when, list) => {
  return match(when, list, false);
};

const and = (when, list) => {
  return match(when, list, true);
};

const double = (item, atual, pleito) => {
  return atual.match(item) && pleito.match(item);
};

export const getSituationStale = ({ proporcional = true, pleito, atual }) => {
  const juridico = {
    deferido: /^(deferido)$/gim,
    deferidoRecurso: /^(deferido(.*)recurso)$/gim,
    indeferido: /^(indeferido)$/gim,
    indeferidoRecurso: /^(indeferido(.*)recurso)$/gim,
    cassado: /^(cassado)$/gim,
    renuncia: /^(ren[úu]ncia)$/gim,
    falecido: /^(falecido)$/gim,
    cassadoRecurso: /^(cassado(.*)recurso)$/gim,

    pendente: /^(pendente(.*)julgamento)/gim,
    cancelado: /^(cancelado)$/gim,
    canceladoRecurso: /^(cancelado(.*)recurso)$/gim,

    conhecido: /^(pedido(.*)conhecido|n[ãa]o(.*)conhecimento(.*)pedido)$/gim,
    conhecidoRecurso:
      /^((pedido(.*)conhecido|n[ãa]o(.*)conhecimento)(.*)recurso)$/gim,
  };

  if (!pleito && !atual) {
    return 4;
  }

  if (or(atual, [juridico.deferido, juridico.deferidoRecurso])) {
    return 0;
  }

  if (
    or(pleito, [
      juridico.renuncia,
      juridico.indeferido,
      juridico.falecido,
      juridico.cancelado,
    ])
  ) {
    return 2;
  }

  if (
    or(pleito, [juridico.deferido, juridico.deferidoRecurso]) &&
    or(atual, [
      juridico.indeferido,
      juridico.indeferidoRecurso,
      juridico.renuncia,
      juridico.falecido,
    ])
  ) {
    return 1;
  }

  if (
    or(atual, [
      juridico.indeferidoRecurso,
      juridico.canceladoRecurso,
      juridico.conhecidoRecurso,
    ])
  ) {
    return 3;
  }

  if (
    or(pleito, [
      juridico.indeferidoRecurso,
      juridico.cassadoRecurso,
      juridico.canceladoRecurso,
      juridico.conhecidoRecurso,
      juridico.conhecido,
    ])
  ) {
    if (
      or(atual, [juridico.indeferido, juridico.cancelado, juridico.cassado])
    ) {
      return 4;
    }
  }

  if (or(atual, [juridico.falecido, juridico.renuncia, juridico.cancelado])) {
    if (or(pleito, [juridico.deferido, juridico.deferidoRecurso])) {
      return 0;
    }
    if (pleito.match(juridico.indeferidoRecurso)) {
      return 3;
    }
    if (pleito.match(juridico.indeferido)) {
      return 4;
    }
  }

  if (or(atual, [juridico.pendente, juridico.conhecido])) {
    return 0;
  }

  if (or(atual, [juridico.cassado])) {
    return 4;
  }

  if (
    or(pleito, [juridico.deferido, juridico.deferidoRecurso, juridico.pendente])
  ) {
    if (atual.match(juridico.indeferido)) {
      return proporcional ? 1 : 4;
    }
  }

  if (pleito.match(juridico.conhecido)) {
    if (or(atual, [juridico.indeferido])) {
      return 4;
    }
  }

  if (double(juridico.conhecido, atual, pleito)) {
    return 2;
  }

  if (pleito.match(juridico.pendente)) {
    if (atual.match(juridico.conhecido)) {
      return 0;
    }
    return 0;
  }

  if (atual.match(juridico.cassadoRecurso)) {
    return 0;
  }

  if (atual.match(juridico.cancelado)) {
    if (pleito.match(juridico.canceladoRecurso)) {
      return 4;
    }
  }

  if (atual.match(juridico.indeferido)) {
    return 4;
  }

  if (!pleito || !atual) {
    return 4;
  }

  return -1;
};

export const getSituationSimplified = ({
  proporcional,
  atual,
  totalizacao,
}) => {
  if (atual.match(/^deferido/gim)) {
    return 0;
  }

  if (
    totalizacao.match(/eleito|suplente|m[eé]dia|turno|substitui[çc][ãa]o/gim)
  ) {
    return 0;
  }

  if (totalizacao.match(/\s(ap[óo]s)\s/gim)) {
    return proporcional ? 1 : 4;
  }

  return 4;
};
