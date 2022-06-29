import { ESTADOS } from '@gavetaio/engine/src/constants';
import { forEachList, sumObject, getPercentage } from '../general';

const setVotes = (obj, data) => {
  sumObject(obj, 'perdidos', data.perdidos);
  sumObject(obj, 'removidos', data.removidos);
  sumObject(obj, 'validos', data.validos);
  sumObject(obj, 'nulos', data.nulos);
  sumObject(obj, 'anulados', data.anulados);
  sumObject(obj, 'splip', data.splip);
  sumObject(obj, 'candidatos', data.candidatos);
  sumObject(obj, 'vagas', data.vagas);
  sumObject(obj, 'brancos', data.brancos);
  sumObject(obj, 'urnados', data.urnados);
  sumObject(obj, 'recursados', data.recursados);
  sumObject(obj, 'total', data.total);
};

const getCandidatos = (situacao) => {
  const { apto = 0, inapto = 0 } = situacao;
  return apto + inapto;
};

const getPleitos = (cargosList) => {
  let pleitos = 0;
  forEachList(cargosList, (cargo) => {
    if (cargo === 'presidente') {
      return;
    }
    pleitos += 1;
  });
  return pleitos;
};

const buildYear = (ano) => {
  ESTADOS.forEach((estado) => {
    ano[estado] = {
      cidades: 0,
      comparecimento: 0,
      cargos: {},
    };
  });
};

const buildUfs = (obj) => {
  ESTADOS.forEach((estado) => {
    obj[estado] = {};
  });
};

export const filterMissingByCity = (list) => {
  const ufs = {};

  buildUfs(ufs);

  list.forEach((data) => {
    const { resumo, cargos } = data;
    const { comparecimento, ano, federal, uf, turno } = resumo;

    if (turno !== '1') {
      return;
    }

    if (!ufs[uf][ano]) {
      ufs[uf][ano] = {
        federal,
        cidades: 0,
        comparecimento: 0,
        cargos: {},
      };
    }

    ufs[uf][ano].cidades += 1;
    ufs[uf][ano].comparecimento += comparecimento;

    forEachList(cargos, (cargo) => {
      ufs[uf][ano].cargos[cargo] = true;
    });
  });

  return ufs;
};

export const filterMissingByYear = (list) => {
  const years = {};

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    const { ano, turno, uf, federal } = item.resumo;

    if (turno !== '1') {
      continue;
    }

    if (!years[ano]) {
      years[ano] = {};
    }

    if (!years[ano][uf]) {
      years[ano][uf] = {
        cidades: 0,
        comparecimento: 0,
        cargos: {},
      };
    }

    if (federal) {
      years[ano][uf].cidades = 0;
      years[ano][uf].total = item.absolutos.total;
      years[ano][uf].comparecimento = item.absolutos.comparecimento;
      forEachList(item.cargos, (cargo) => {
        years[ano][uf].cargos[cargo] = true;
      });
    } else {
      years[ano][uf].cidades += 1;
      years[ano][uf].total += item.absolutos.total;
      years[ano][uf].comparecimento += item.absolutos.comparecimento;
      forEachList(item.cargos, (cargo) => {
        years[ano][uf].cargos[cargo] = true;
      });
    }
  }

  return years;
};

export const filterResumoByYear = (list) => {
  const result = [];
  const groups = {};

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    const { ano, turno } = item.resumo;

    if (turno !== '1') {
      continue;
    }

    if (!groups[ano]) {
      groups[ano] = {
        isFederal: !!item.multipliers?.prefeito,
        cargos: {},
      };
    }

    groups[ano].turno = turno;
    const pleitos = getPleitos(item.multipliers);
    let broken = 0;

    if (item.broken) {
      broken = getPleitos(item.broken);
    }

    forEachList(item.cargos, (cargo, data) => {
      if (!groups[ano].cargos[cargo] && !cargo.match(/deputado_distrital/gim)) {
        groups[ano].cargos[cargo] = {};
      }

      if (cargo.match(/deputado_federal|senador/gim)) {
        if (!groups[ano].parlamento) {
          groups[ano].parlamento = {};
        }
        setVotes(groups[ano].parlamento, data);
      }

      if (cargo.match(/deputado_distrital/gim)) {
        setVotes(groups[ano].cargos.deputado_estadual, data);
        return;
      }

      setVotes(groups[ano].cargos[cargo], data);
    });

    sumObject(groups[ano], 'pleitos', pleitos);
    sumObject(groups[ano], 'broken', broken);
    sumObject(groups[ano], 'comparecimento', item.absolutos.comparecimento);
    sumObject(groups[ano], 'votos', item.absolutos.total);
    sumObject(groups[ano], 'removidos', item.absolutos.removidos);
    if (item?.situacao) {
      sumObject(groups[ano], 'deferidos', item.situacao.du + item.situacao.dru);
      sumObject(groups[ano], 'ir', item.situacao.iru);
      sumObject(groups[ano], 'ira', item.situacao.irua);
      sumObject(groups[ano], 'candidatos', getCandidatos(item.situacao));
    }
  }

  forEachList(groups, (id, data) => {
    const deferidos = getPercentage(data.deferidos, data.candidatos);
    const ira = getPercentage(data.ira, data.candidatos);
    const ir = getPercentage(data.ir, data.candidatos);
    const afetados = Math.round(
      (data.removidos / data.votos) * data.comparecimento
    );
    const afetadosPercentage = getPercentage(afetados, data.comparecimento);
    const broken = getPercentage(data.broken, data.pleitos);

    const row = {
      id,
      ...data,
      afetados,
      percentage: {
        broken,
        ir,
        ira,
        deferidos,
        afetados: afetadosPercentage,
      },
    };

    result.push(row);
  });

  return result;
};
