import { isRecursado } from "@gavetaio/core/utils/engine/situations";

const { forEachList } = require("../helpers");

const getInfoFromId = (id) => {
  const split = id.split("-");
  if (split.length === 5) {
    const cargo = split[3];
    const turno = split[2];
    const partido = split[4].replace(/([0-9]{2}).*/gim, "$1");
    return {
      cargo,
      turno,
      partido,
      scope: null,
    };
  }

  const scope = split[3];
  const cargo = split[4];
  const turno = split[2];
  const partido = split[5].replace(/([0-9]{2}).*/gim, "$1");
  return {
    cargo,
    turno,
    partido,
    scope,
  };
};

const getString = (str) => {
  return str.replace(/ /gim, "-").replace(/\s+/gim, "").trim();
};

const getVotesFromCandidate = (id, turnoData) => {
  const isFederal = !!id.match(/prefeito/);
  const split = id.split("-");
  if (!isFederal) {
    if (
      turnoData &&
      turnoData.cidades &&
      turnoData.cidades[split[3]] &&
      turnoData.cidades[split[3]].candidatos &&
      turnoData.cidades[split[3]].candidatos[split[4]] &&
      turnoData.cidades[split[3]].candidatos[split[4]][
        `${split[4]}-${split[5]}`
      ] &&
      turnoData.cidades[split[3]].candidatos[split[4]][
        `${split[4]}-${split[5]}`
      ].votos
    ) {
      return turnoData.cidades[split[3]].candidatos[split[4]][
        `${split[4]}-${split[5]}`
      ].votos;
    }
  }
  return 0;
};

export const investigateIndeferidos = ({ callback, resultados }) => {
  forEachList(resultados, (turnoId, turnoData) => {
    const { coligacoes } = turnoData;
    const turno = turnoId.match(/1/) ? "1" : "2";

    forEachList(coligacoes, (id, coligacao) => {
      const { situacao, resultado, urna, pleito, atual } = coligacao;
      const { partido, cargo, scope } = getInfoFromId(id);

      if (cargo.match(/(suplente|vice)/gim)) {
        return;
      }

      const raw = { urna, pleito, atual };

      const string = `${getString(urna)}_${getString(pleito)}_${getString(
        atual
      )}`;

      const votes = getVotesFromCandidate(id, turnoData);

      if (votes) {
        callback({
          turno,
          path: `situacao.mapeados.${string}.votos`,
          scope: null,
          add: votes,
        });
      }

      callback({
        turno,
        path: `situacao.mapeados.${string}.soma`,
        scope: null,
        add: 1,
      });

      callback({
        turno,
        path: `situacao.mapeados.${string}.ids`,
        scope: null,
        unique: id,
        limit: 6,
      });

      const situacaoString = typeof situacao === "number" ? `${situacao}` : `-`;

      callback({
        turno,
        path: `situacao.mapeados.${string}.situacao.${situacaoString}`,
        scope: null,
        add: 1,
      });

      const resultadoString =
        typeof resultado === "number" ? `${resultado}` : `-`;

      if (typeof resultado !== "number") {
        throw "#221";
      }

      callback({
        turno,
        path: `situacao.mapeados.${string}.resultado.${resultadoString}`,
        scope: null,
        add: 1,
      });

      if (situacao !== 0 && (resultado === 1 || resultado === 6)) {
        callback({
          turno,
          path: `situacao.forcados`,
          scope: null,
          push: {
            id,
            raw,
            coligacao,
          },
        });
      }

      if (situacao === 0) {
        callback({
          turno,
          path: `situacao.apto`,
          scope: null,
          add: 1,
        });

        callback({
          turno,
          path: `situacao.${cargo}.apto`,
          scope: null,
          add: 1,
        });
      } else {
        callback({
          turno,
          path: `situacao.inapto`,
          scope: null,
          add: 1,
        });
        callback({
          turno,
          path: `situacao.${cargo}.inapto`,
          scope: null,
          add: 1,
        });
      }

      if (raw.pleito.match(/^deferido$/gim)) {
        callback({
          turno,
          path: `situacao.du`,
          scope: null,
          add: 1,
        });

        if (situacao !== 0) {
          callback({
            turno,
            path: `situacao.dui`,
            scope: null,
            add: 1,
          });
        }
      }

      if (raw.pleito.match(/^deferido(.*)recurso$/gim)) {
        callback({
          turno,
          path: `situacao.dru`,
          scope: null,
          add: 1,
        });

        if (situacao !== 0) {
          callback({
            turno,
            path: `situacao.drui`,
            scope: null,
            add: 1,
          });
        } else {
          callback({
            turno,
            path: `situacao.drua`,
            scope: null,
            add: 1,
          });
        }
      }

      if (!raw.pleito.match(/^(indeferido|deferido|ren[uú]ncia|cassado)/gim)) {
        callback({
          turno,
          path: `situacao.nu`,
          scope: null,
          add: 1,
        });

        if (situacao !== 0) {
          callback({
            turno,
            path: `situacao.nui`,
            scope: null,
            add: 1,
          });
        } else {
          callback({
            turno,
            path: `situacao.nua`,
            scope: null,
            add: 1,
          });
        }
      }

      if (isRecursado({ ...raw })) {
      }

      if (
        raw.pleito.match(/indeferido(.*)recurso/gim) ||
        raw.urna.match(/indeferido(.*)recurso/gim)
      ) {
        callback({
          turno,
          path: `situacao.iru`,
          scope: null,
          add: 1,
        });

        callback({
          turno,
          path: `absolutos.iru`,
          scope,
          add: 1,
        });

        callback({
          turno,
          path: `cargos.${cargo}.iru`,
          scope,
          add: 1,
        });

        if (situacao !== 0) {
          callback({
            turno,
            path: `situacao.irui`,
            scope: null,
            add: 1,
          });
        } else {
          callback({
            turno,
            path: `situacao.irua`,
            scope: null,
            add: 1,
          });

          callback({
            turno,
            path: `absolutos.irua`,
            scope,
            add: 1,
          });

          callback({
            turno,
            path: `cargos.${cargo}.irua`,
            scope,
            add: 1,
            scoped: true,
          });

          callback({
            turno,
            path: `partidos.${cargo}.${partido}.irua`,
            scope,
            add: 1,
          });
        }
      }

      if (raw.pleito.match(/^(indeferido)$/gim)) {
        callback({
          turno,
          path: `situacao.iu`,
          scope: null,
          add: 1,
        });

        if (situacao === 0) {
          callback({
            turno,
            path: `situacao.iua`,
            scope: null,
            add: 1,
          });
        } else {
          callback({
            turno,
            path: `situacao.iui`,
            scope: null,
            add: 1,
          });
        }
      }

      if (
        raw.pleito.match(/^(falecido)$/gim) ||
        raw.atual.match(/^(falecido)$/gim)
      ) {
        callback({
          turno,
          path: `situacao.f`,
          scope: null,
          add: 1,
        });
      }

      if (
        raw.pleito.match(/^(ren[úu]ncia)$/gim) ||
        raw.atual.match(/^(ren[úu]ncia)$/gim)
      ) {
        callback({
          turno,
          path: `situacao.r`,
          scope: null,
          add: 1,
        });
      }

      if (
        !raw.pleito.match(/^(ren[úu]ncia)$/gim) &&
        raw.atual.match(/^(ren[úu]ncia)$/gim)
      ) {
        callback({
          turno,
          path: `situacao.qur`,
          scope: null,
          add: 1,
        });
      }

      if (raw.pleito.match(/^(ren[úu]ncia)$/gim)) {
        callback({
          turno,
          path: `situacao.ru`,
          scope: null,
          add: 1,
        });
      }

      if (raw.pleito.match(/^(falecido)$/gim)) {
        callback({
          turno,
          path: `situacao.fu`,
          scope: null,
          add: 1,
        });
      }

      if (
        raw.atual.match(/^(deferido)$/gim) &&
        raw.atual.match(/^(falecido)$/gim)
      ) {
        callback({
          turno,
          path: `situacao.fa`,
          scope: null,
          add: 1,
        });
      }
    });
  });
};
