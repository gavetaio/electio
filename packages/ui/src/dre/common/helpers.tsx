export const getPartidoFromList = ({ numero, list }) => {
  const test = typeof numero === "number" ? `${numero}` : numero;

  if (!test) {
    return null;
  }
  return list.find((partido) => partido.numero === test);
};

export const genderFlip = (nome) => {
  const split = nome.split(" ");
  if (split[0].trim().match(/(or)$/gim)) {
    split[0] = split[0].replace(/(.*)(or)$/gim, "$1ora");
  }

  if (split[0].trim().match(/(o)$/gim)) {
    split[0] = split[0].replace(/(.*)(o)$/gim, "$1a");
  }

  return split.join(" ");
};

export const getCargoDisplayTitle = ({ current, state }) => {
  const title = current?.label;
  if (state?.candidato?.genero && state?.candidato?.genero !== 2) {
    return genderFlip(title);
  }

  return title;
};

export const getTransformedNumero = (status, numbers) => {
  const { isNulo, isBranco, isLegenda, hasCandidato } = status;

  if (isBranco) {
    return "95";
  }

  if (isNulo) {
    return "96";
  }

  if (isLegenda && !hasCandidato) {
    return numbers.slice(0, 2).join("");
  }

  return numbers.join("");
};
