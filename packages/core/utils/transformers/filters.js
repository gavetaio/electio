const compareStatic = (list, item) => {
  if (list.indexOf(item) === -1) {
    return false;
  }
  return true;
};

const compareArrays = (list, items) => {
  let result = false;
  list.forEach((listItem) => {
    items.forEach((item) => {
      if (item === listItem) {
        result = true;
      }
    });
  });
  return result;
};

export const applyFilter = ({
  filters,
  ano = null,
  cargo = null,
  uf = null,
  anos = null,
  cargos = null,
  ufs = null,
}) => {
  if (ano && filters.years?.length && !compareStatic(filters.years, ano)) {
    return false;
  }

  if (
    cargo &&
    filters.cargos?.length &&
    !compareStatic(filters.cargos, cargo)
  ) {
    return false;
  }

  if (uf && filters.ufs?.length && !compareStatic(filters.ufs, uf)) {
    return false;
  }

  if (
    anos?.length &&
    filters.years?.length &&
    !compareArrays(filters.years, anos)
  ) {
    return false;
  }

  if (
    cargos?.length &&
    filters.cargos?.length &&
    !compareArrays(filters.cargos, cargos)
  ) {
    return false;
  }

  if (ufs?.length && filters.ufs?.length && !compareArrays(filters.ufs, ufs)) {
    return false;
  }

  return true;
};
