const { forEachList } = require("../helpers");

const injectCandidateCount = ({ turno, data, scope = null, callback }) => {
  const total = {
    all: 0,
    inelegiveis: 0,
    deferidos: 0,
  };

  forEachList(data.candidatos, (cargo, candidatos) => {
    let inelegiveis = 0;
    let deferidos = 0;

    forEachList(candidatos, (nome, info) => {
      if (info.situacao !== 0) {
        inelegiveis += 1;
      }
      if (
        info.raw &&
        info.raw.pleito.match(/^deferido$/gim) &&
        info.raw.urna.match(/^deferido$/gim) &&
        info.raw.atual.match(/^deferido$/gim)
      ) {
        deferidos += 1;
      }
    });

    const count = Object.keys(candidatos).length;

    total.all += count;
    total.inelegiveis += inelegiveis;
    total.deferidos += deferidos;

    callback({
      turno,
      scope,
      path: `cargos.${cargo}.`,
      data: [
        { path: "candidatos", add: count },
        { path: "inelegiveis", add: inelegiveis },
        { path: "deferidos", add: deferidos },
      ],
    });
  });

  callback({
    turno,
    scope,
    path: `absolutos.`,
    data: [
      { path: "candidatos", add: total.all },
      { path: "inelegiveis", add: total.inelegiveis },
      { path: "deferidos", add: total.deferidos },
    ],
  });
};

const injectCandidate = ({ isFederal, turno, data, callback }) => {
  if (isFederal) {
    injectCandidateCount({ turno, data, scope: null, callback });
  } else {
    forEachList(data.cidades, (codigo, cidade) => {
      injectCandidateCount({ turno, data: cidade, scope: codigo, callback });
    });
  }
};

export const populateCityInfo = ({
  resultados,
  callback,
  suplementares,
  accumulator,
}) => {
  const isFederal = accumulator.headers.federal;

  forEachList(suplementares, (codigo, data) => {
    const { TURNO, SCOPE } = data;
    callback({
      turno: TURNO,
      scope: SCOPE,
      path: `suplementar`,
      value: true,
      scoped: true,
    });
  });

  forEachList(resultados, (turno, data) => {
    const turnoNumber = turno.split("_")[1];
    injectCandidate({ isFederal, turno: turnoNumber, data, callback });
  });
};
