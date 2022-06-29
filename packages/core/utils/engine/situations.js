export const isRemovido = (situacao) => {
  if (situacao > 1) {
    return true;
  }
  return false;
};

export const isRecursado = ({ urna, pleito, atual }) => {
  if (pleito?.match(/sub(.)j[uú]dice/gim)) {
    return true;
  }

  if (
    urna.match(/^indeferido(.*)recurso$/gim) &&
    !pleito.match(/^deferido/gim)
  ) {
    return true;
  }

  return false;
};

export const isUrnado = ({ pleito }) => {
  if (
    pleito.match(/^(indeferido|cassado|ren[úu]ncia|falecido|cancelado)$/gim)
  ) {
    return true;
  }
  return false;
};
