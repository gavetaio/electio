const { forEachList, average, roundTwo } = require("@gavetaio/core");

export const investigateBoxVoting = ({
  resultados,
  callback,
  suplementares,
  accumulator,
  boxes,
}) => {
  const isFederal = accumulator.headers.federal;
  const turnoData = resultados.turno_1;

  if (!turnoData) {
    return;
  }

  const { cargos, cidades } = turnoData;
  const turno = "1";
  const result = {
    general: {},
    cidades: {},
  };

  forEachList(cargos, (cargo, data) => {
    result.general[cargo] = {
      candidatos: data.candidatos,
      data: [],
      max: { total: 0, box: null },
      min: { total: 0, box: null },
    };
  });

  forEachList(boxes, (id, box) => {
    if (box.turno !== turno) {
      return;
    }

    if (!box.validos) {
      return;
    }

    let source = turnoData;

    if (box.scope) {
      source = cidades[box.scope];
    }

    forEachList(result.general, (cargo, cargoData) => {
      const candidatos = source.cargos[cargo].candidatos;
      const reg = new RegExp(`${cargo}`, "mig");
      const voted = box.validos.filter((vote) => vote.nome.match(reg));
      const percentage = (100 * voted.length) / candidatos;

      if (voted?.length) {
        result.general[cargo].data.push(percentage);

        if (percentage > result.general[cargo].max.total) {
          result.general[cargo].max.total = percentage;
          result.general[cargo].max.box = box.id;
        }
        if (
          percentage < result.general[cargo].min.total ||
          !result.general[cargo].min.total
        ) {
          result.general[cargo].min.total = percentage;
          result.general[cargo].min.box = box.id;
        }
      }

      if (box.scope) {
        if (!result.cidades[box.scope]) {
          result.cidades[box.scope] = {};
        }
        if (!result.cidades[box.scope][cargo]) {
          result.cidades[box.scope][cargo] = {
            candidatos,
            data: [],
            max: { total: 0, box: null },
            min: { total: 0, box: null },
          };
        }

        if (percentage > result.cidades[box.scope][cargo].max.total) {
          result.cidades[box.scope][cargo].max.total = percentage;
          result.cidades[box.scope][cargo].max.box = box.id;
        }
        if (
          percentage < result.cidades[box.scope][cargo].min.total ||
          !result.cidades[box.scope][cargo].min.total
        ) {
          result.cidades[box.scope][cargo].min.total = percentage;
          result.cidades[box.scope][cargo].min.box = box.id;
        }

        result.cidades[box.scope][cargo].data.push(percentage);
      }
    });
  });

  forEachList(result.general, (cargo, info) => {
    callback({
      turno,
      path: `voting.${cargo}.average`,
      value: roundTwo(average(info.data)),
    });

    if (info?.max?.total) {
      callback({
        turno,
        path: `voting.${cargo}.max`,
        value: info.max,
      });

      callback({
        turno,
        path: `boxes.printer`,
        push: info.max.box,
      });
    }

    if (info?.min?.total) {
      callback({
        turno,
        path: `voting.${cargo}.min`,
        value: info.min,
      });

      callback({
        turno,
        path: `boxes.printer`,
        push: info.min.box,
      });
    }
  });

  if (!isFederal) {
    forEachList(result.cidades, (cidade, info) => {
      forEachList(info, (cargo, cargoData) => {
        callback({
          turno,
          scope: cidade,
          path: `voting.${cargo}.average`,
          value: roundTwo(average(cargoData.data)),
          scoped: true,
        });

        if (cargoData?.max?.total) {
          callback({
            turno,
            scope: cidade,
            path: `voting.${cargo}.max`,
            value: cargoData.max,
            scoped: true,
          });

          callback({
            turno,
            path: `boxes.printer`,
            push: cargoData.max.box,
          });
        }

        if (cargoData?.min?.total) {
          callback({
            turno,
            scope: cidade,
            path: `voting.${cargo}.min`,
            value: cargoData.min,
            scoped: true,
          });
          callback({
            turno,
            path: `boxes.printer`,
            push: cargoData.min.box,
          });
        }
      });
    });
  }
};
