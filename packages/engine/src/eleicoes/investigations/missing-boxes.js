const {
  getOtherBox,
  forEachList,
  forEachListBreakable,
} = require("@gavetaio/core");

const { LoggerSingleton } = require("../../log");
const { log } = LoggerSingleton.getInstance();

const getSizeFromBox = ({ box, boxes, multipliers }) => {
  const { cargos, absolutos, id } = box;

  const result = {
    tamanho: 0,
    estimado: 0,
  };

  if (absolutos?.tamanho) {
    result.tamanho = absolutos.tamanho;
    return result;
  }

  if (absolutos?.aptos) {
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

  const filterId = `${splitId[0]}-${splitId[1]}-${splitId[2]}-${splitId[3]}-${splitId[4]}`;
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
    const average = Math.round((sumSizes * 1.1) / totalBoxes);
    if (average) {
      result.estimado = average;
      return result;
    }
  }

  return result;
};

const findSimilarBox = (id, boxes) => {
  const splitted = id.split("-");
  const similarId = `${splitted[0]}-${splitted[1]}-${splitted[2]}-${splitted[3]}`;
  let similarBox = null;
  const reg = new RegExp(similarId, "mig");
  forEachListBreakable(boxes, (boxId) => {
    if (boxId.match(reg)) {
      similarBox = boxes[boxId];
      return true;
    }
    return false;
  });
  return similarBox;
};

const investigateMisssingBox = () => {};

export const investigateMissingBoxes = ({
  accumulator,
  resultados,
  boxes,
  cesc,
  callback,
  setBox,
}) => {
  forEachList(cesc, (id, data) => {
    if (boxes[id]) {
      return;
    }

    const splitted = id.split("-");
    const turno = splitted[2];
    const codigo = splitted[3];
    const uf = splitted[0];
    const zona = splitted[4];
    const secao = splitted[5];

    const cidade = resultados[`turno_${turno}`].cidades?.[codigo];

    const similarBox = findSimilarBox(id, boxes);
    const turnoData = resultados[`turno_${turno}`];
    const { federal } = accumulator.headers;
    const scope = federal ? null : codigo;

    let comparecimentoMedio = 0;

    if (federal) {
      const { comparecimento } = turnoData.absolutos;
      const urnas = turnoData.boxes.sum;
      comparecimentoMedio = Math.round(comparecimento / urnas);
    } else {
      const { comparecimento } = cidade;
      const urnas = cidade.boxes.sum;
      comparecimentoMedio = Math.round(comparecimento / urnas);
    }

    const boxSize = getSizeFromBox({
      box: { id, turno },
      boxes,
      multipliers: turnoData.multipliers,
    });

    if (secao === 64 && zona === 19) {
      boxSize.tamanho = 396;
    }

    const other = getOtherBox({ id, turno }, boxes);

    const eleitores = boxSize.tamanho || boxSize.estimado;
    let perdidos = 0;
    const cargos = {};
    let multiplier = 0;

    forEachList(turnoData.multipliers, (cargo, number) => {
      cargos[cargo] = {};
      multiplier += number;
    });

    perdidos = eleitores * multiplier;

    forEachList(cargos, (id, data) => {
      cargos[id].perdidos = eleitores * turnoData.multipliers[id];
    });

    const municipio = similarBox ? similarBox.municipio : null;

    const missing = {
      turno,
      id,
      upsert: {
        id,
        uf,
        turno,
        zona,
        secao,
        codigo,
        municipio,
        scope,
        local: null,
        status: "perdida",
        cargos,
        absolutos: {
          perdidos,
          estimado: eleitores,
        },
      },
    };

    log("EMULATE DMISSING BOX");

    log("FOUND MISSING_BOX", { emoji: "🛑" });

    setBox(missing);

    callback({
      turno,
      scope,
      path: `problemas`,
      push: {
        id,
        type: "NULL_BOX",
        count: perdidos,
        extra: {
          estimado: eleitores,
          media: comparecimentoMedio,
        },
      },
    });

    forEachList(cargos, (cargo, { perdidos }) => {
      callback({
        id,
        turno,
        scope,
        path: `cargos.${cargo}.perdidos`,
        add: perdidos,
        scoped: true,
      });
    });

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
        extra: {
          estimado: eleitores,
          media: comparecimentoMedio,
        },
      },
    });
  });
};
