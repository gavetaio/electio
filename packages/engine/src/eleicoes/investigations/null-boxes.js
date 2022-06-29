const { forEachList, getOtherBox } = require("@gavetaio/core");

const getSizeFromBox = ({ box, boxes, multipliers }) => {
  const { cargos, absolutos, id } = box;

  const result = {
    tamanho: 0,
    estimado: 0,
  };

  if (absolutos.tamanho) {
    result.tamanho = absolutos.tamanho;
    return result;
  }

  if (absolutos.aptos) {
    result.tamanho = absolutos.aptos;
    return result;
  }

  let size = 0;

  forEachList(multipliers, (cargo, multiplier) => {
    if (!cargos?.[cargo]?.total) {
      return;
    }
    size = cargos[cargo].total / multiplier;
  });

  if (size) {
    result.estimado = size;
    return result;
  }

  const other = getOtherBox(box, boxes);

  if (other) {
    if (other.absolutos?.aptos) {
      result.estimado = other.absolutos.aptos;
      return result;
    }
    if (other.absolutos?.tamanho) {
      result.estimado = other.absolutos.tamanho;
      return result;
    }
  }

  const splitId = id.split("-");
  const filterId = `${splitId[0]}-${splitId[1]}-${splitId[2]}-${splitId[3]}`;
  const filterReg = new RegExp(`^${filterId}.*`, "mig");
  let sumSizes = 0;
  let totalBoxes = 0;

  forEachList(boxes, (boxId, boxData) => {
    if (boxId.match(filterReg)) {
      sumSizes += boxData?.absolutos?.tamanho || 0;
      totalBoxes += 1;
    }
  });
  if (sumSizes && totalBoxes) {
    const average = Math.round((sumSizes * 0.9) / totalBoxes);
    if (average) {
      result.estimado = average;
      return result;
    }
  }

  return result;
};

const pushPerdidos = ({ id, turno, scope, callback, perdidos }) => {
  const extra = {
    total: perdidos,
  };

  callback({
    id,
    turno,
    scope,
    path: "absolutos.perdidos",
    add: perdidos,
  });

  callback({
    id,
    path: `problemas`,
    push: {
      type: "NULL_BOX",
      count: perdidos,
      extra,
    },
  });

  callback({
    turno,
    scope,
    path: `problemas`,
    push: {
      id,
      type: "NULL_BOX",
      count: perdidos,
      extra,
    },
  });
};

const checkNaoInstaladas = ({ box, multipliers, boxes, callback }) => {
  const { turno, scope, cargos, id } = box;

  if (cargos && Object.keys(cargos).length) {
    return;
  }

  const boxSize = getSizeFromBox({ box, boxes, multipliers });
  const size = boxSize.tamanho || boxSize.estimado;

  let perdidos = 0;
  forEachList(multipliers, (cargo, multiplier) => {
    const votos = size * multiplier;
    perdidos += votos;
    callback({
      id,
      turno,
      scope,
      path: `cargos.${cargo}.perdidos`,
      add: votos,
      scoped: true,
    });
  });

  if (boxSize?.estimado) {
    callback({
      id,
      path: `absolutos.estimado`,
      add: size,
    });
  }

  pushPerdidos({ id, turno, scope, cargos, callback, perdidos });
};

const checkNulled = ({ box, boxes, multipliers, callback }) => {
  const { turno, scope, cargos, id } = box;

  let isNullBox = false;
  let multiplier = 0;
  forEachList(multipliers, (cargo, value) => {
    multiplier += value;
    if (!cargos[cargo]) {
      return;
    }
    const info = cargos[cargo];
    if (!info.total) {
      return;
    }

    if (info.total === info.nulos) {
      isNullBox = true;
    } else {
      isNullBox = false;
    }
  });

  if (!isNullBox) {
    return;
  }

  const boxSize = getSizeFromBox({ box, boxes, multipliers });
  const size = boxSize.tamanho || boxSize.estimado;

  forEachList(multipliers, (cargo, value) => {
    callback({
      id,
      turno,
      scope,
      path: `cargos.${cargo}.perdidos`,
      add: size * value,
      scoped: true,
    });
  });

  if (boxSize?.estimado) {
    callback({
      id,
      path: `absolutos.estimado`,
      add: size,
    });
  }

  pushPerdidos({
    id,
    turno,
    scope,
    cargos,
    callback,
    perdidos: size * multiplier,
  });
};

export const investigateNullBoxes = ({ resultados, boxes, callback }) => {
  forEachList(boxes, (id, box) => {
    const { cargos } = box;
    const turnoData = resultados[`turno_${box.turno}`];
    const { multipliers } = turnoData;

    if (cargos && Object.keys(cargos).length) {
      checkNulled({ box, boxes, turnoData, multipliers, callback });
      return;
    }

    checkNaoInstaladas({ box, multipliers, boxes, callback });
  });
};
