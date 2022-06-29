const orderBy = require("lodash/orderBy");
const { LoggerSingleton } = require("../log");
const {
  deepClone,
  forEachList,
  isEmptyObject,
  getOtherBox,
} = require("@gavetaio/core");

const { saveFiles, pushUniqueBox } = require("./printer/utils");

const { log } = LoggerSingleton.getInstance();

export const orderProblemsBySize = (turno) => {
  if (turno.problemas && turno.problemas.length) {
    const ordered = orderBy(turno.problemas, ["count"], ["desc"]);
    turno.problemas = ordered;
  }
};

const injectBasicResults = ({ result, boxes, turno }) => {
  const boxKeys = Object.keys(boxes);
  let box = null;

  for (let i = 0; i < boxKeys.length; i += 1) {
    box = boxes[boxKeys[i]];
    if (box.turno === turno) {
      break;
    }
  }

  const keyInfo = box.id.split("-");

  const info = {
    id: `${keyInfo[0]}-${keyInfo[1]}-${keyInfo[2]}`,
    uf: keyInfo[0],
    ano: keyInfo[1],
    turno: keyInfo[2],
    problemas: {},
  };

  info.problemas = result.problemas?.length || 0;
  info.warnings = result.warnings?.length || 0;
  info.perdidos = result.absolutos?.perdidos || 0;
  info.expostos = result.absolutos?.expostos || 0;

  result.resumo = info;
};

export const cloneTurnoProps = ({ result, turnoData, removed }) => {
  const props = Object.keys(turnoData);
  for (let i = 0; i < props.length; i += 1) {
    const prop = props[i];
    if (removed.indexOf(prop) !== -1) {
      continue;
    }
    switch (prop) {
      case "candidatos":
      case "cidades":
        break;

      default:
        result[prop] = deepClone(turnoData[prop]);
    }
  }
};

const cleanUpCidades = (cidades) => {
  forEachList(cidades, (codigo, data) => {
    cidades[codigo] = {
      ...cidades[codigo],
      zonas: null,
    };
  });
};

export const turnoTransformer = ({
  turno,
  turnoData,
  removed,
  boxes,
  extra = [],
}) => {
  const result = {
    resumo: null,
    cargos: null,
    problemas: null,
    partidos: null,
    boxes: null,
  };

  const candidatosSize = Object.keys(turnoData.candidatos)?.length || 0;
  const candidatos = candidatosSize ? deepClone(turnoData.candidatos) : null;

  const cidades = deepClone(turnoData?.cidades ? turnoData.cidades : {});
  cleanUpCidades(cidades);

  orderProblemsBySize(turnoData);
  cloneTurnoProps({ result, turnoData, removed });
  injectBasicResults({ result, boxes, turno });

  const boxList = [];

  if (turnoData.problemas?.length) {
    boxList.push(
      ...printBoxProblems({
        boxes,
        list: turnoData.problemas,
      })
    );
  }

  if (turnoData.warnings?.length) {
    boxList.push(
      ...printBoxProblems({
        boxes,
        list: turnoData.warnings,
      })
    );
  }

  if (turnoData.boxes?.printer?.length) {
    turnoData.boxes.printer.forEach((box) => {
      pushUniqueBox(boxes[box], boxList);
    });
  }

  if (extra?.length) {
    extra.forEach((item) => {
      const data = item.split("-");
      if (data.length === 1) {
        const cidade = data[0];

        forEachList(boxes, (id, box) => {
          if (box.codigo === cidade) {
            pushUniqueBox(box, boxList);
          }
        });
      }
    });
  }

  return { result, candidatos, cidades, boxes: boxList };
};

export const printBoxProblems = ({ boxes, list }) => {
  const result = [];
  if (!list || !list.length) {
    return result;
  }

  for (let i = 0; i < list.length; i += 1) {
    const { id } = list[i];

    if (!id || id.split("-").length !== 6 || !boxes[id]) {
      continue;
    }
    pushUniqueBox(boxes[id], result);

    const other = getOtherBox({ box: boxes[id], boxes });
    if (other) {
      pushUniqueBox(other, result);
    }
  }

  return result;
};

const logWarningSummary = (transformed) => {
  const { warnings } = transformed.result;
  const summary = {};
  if (warnings?.length) {
    warnings.forEach(({ id, type, count }) => {
      if (!summary[`${type}`]) {
        summary[`${type}`] = {
          boxes: [],
          count: 0,
          total: 0,
        };
      }
      summary[`${type}`].boxes.push(id);
      summary[`${type}`].count += count;
    });
  }

  forEachList(summary, (type, { count, boxes }) => {
    const text = `${boxes.length} BOXES ← ${count} VOTES`;
    log([type, text], {
      emoji: "⚠️ ",
    });
  });
};

const logProblemsSummary = (problemas) => {
  if (!problemas?.length) {
    return;
  }

  problemas.forEach((problema) => {
    const text = [problema.count];
    if (problema.id) {
      text.push(problema.id);
    }
    log([problema.type, text.join("; ")], {
      emoji: "🛑",
    });
  });
};

export const printTurno = ({ turnoData, turno, boxes, removed, extra }) => {
  log(["CREATING STRUCTURE", turno.toUpperCase()], {
    emoji: "🗄 ",
    marginTop: true,
  });

  if (!turnoData?.absolutos?.total) {
    return null;
  }

  const transformed = turnoTransformer({
    boxes,
    turnoData,
    turno,
    removed,
    extra,
  });

  const files = [];

  if (!transformed.result) {
    throw "#76765";
  }

  const { id } = transformed.result.resumo;

  files.push({
    object: transformed.result,
    name: id,
  });
  if (transformed.cidades) {
    files.push({
      object: transformed.cidades,
      name: `${id}-cidades`,
    });
  }
  if (transformed.candidatos) {
    files.push({
      object: transformed.candidatos,
      name: `${id}-candidatos`,
    });
  }

  const suffix = transformed.result.resumo.ano || "1899";

  const commit = [];

  if (transformed?.result?.problemas) {
    logProblemsSummary(transformed.result.problemas);
  }

  if (transformed.boxes?.length) {
    commit.push(...transformed.boxes);
  }

  files.push({
    object: commit,
    name: `${id}-boxes`,
  });

  log("CREATED", {
    emoji: "☑️ ",
  });

  return {
    suffix,
    files,
  };
};

export const printBallots = ({
  accumulator,
  removed = [],
  extra,
  getParentData,
}) => {
  const { boxes, resultados } = accumulator;
  const turnos = Object.keys(resultados);

  if (!boxes || !Object.keys(boxes)?.length) {
    log("NO DATA TO GENERATE", { emoji: "🗄 " });
    return;
  }

  if (!turnos?.length) {
    throw "#87609";
  }

  log("GENERATING FILES", { emoji: "🗄 ", marginTop: true });

  const result = [];

  turnos.forEach((turno) => {
    log([`TURNO - ${turno}`], {
      system: true,
    });

    const transformed = printTurno({
      turnoData: accumulator.resultados[turno],
      turno: turno.replace("turno_", ""),
      boxes,
      removed,
      extra,
    });

    if (!transformed) {
      return;
    }

    log(["PUSHING FILES"], {
      system: true,
    });

    result.push(...transformed.files);
  });

  log(["GO TO SAVE "], {
    system: true,
  });

  try {
    saveFiles(result);
  } catch (e) {}
};
