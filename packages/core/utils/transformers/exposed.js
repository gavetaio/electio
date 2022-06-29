import { forEachList, sumObject, getPercentage } from '../general';

const getPleitos = (cargosList) => {
  let pleitos = 0;
  forEachList(cargosList, (cargo, data) => {
    if (cargo === 'presidente') {
      return;
    }

    pleitos += 1;
  });
  return pleitos;
};

export const filterExposedByYear = (list) => {
  const result = [];
  const groups = {};

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];

    const { ano, turno, federal = false } = item.resumo;

    if (turno !== '1') {
      continue;
    }

    if (!groups[ano]) {
      groups[ano] = {
        isFederal: federal,
        pleitos: 0,
      };
    }

    groups[ano].turno = turno;
    const pleitos = getPleitos(item.multipliers);
    let broken = 0;

    if (item.broken) {
      broken = getPleitos(item.broken);
    }

    sumObject(groups[ano], 'pleitos', pleitos);
    sumObject(groups[ano], 'broken', broken);
    sumObject(groups[ano], 'comparecimento', item.absolutos.comparecimento);
    sumObject(groups[ano], 'votos', item.absolutos.total);
    sumObject(groups[ano], 'removidos', item.absolutos.removidos);
    sumObject(groups[ano], 'recursados', item.absolutos.recursados);
    sumObject(
      groups[ano],
      'deferidos',
      (item?.situacao?.du || 0) + (item?.situacao?.dru || 0)
    );
    sumObject(groups[ano], 'ir', item.situacao?.iru || 0);
    sumObject(groups[ano], 'ira', item.situacao?.irua || 0);
    sumObject(groups[ano], 'candidatos', item.absolutos.candidatos);
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

export const filterExposedByUf = (list) => {
  if (!list.length) {
    return null;
  }

  const result = [];
  const years = {};

  for (let i = 0; i < list.length; i += 1) {
    const { resumo, absolutos = null } = list[i];
    const { uf, ano, turno } = resumo;
    if (turno !== '1') {
      continue;
    }

    if (!absolutos) {
      continue;
    }

    const {
      comparecimento = 0,
      anulados = 0,
      invalidados = 0,
      recursados = 0,
      removidos = 0,
      total = 0,
    } = absolutos;

    const totalPerdidos = anulados + invalidados;

    if (!total) {
      continue;
    }

    if (!years[ano]) {
      years[ano] = {};
    }

    if (!years[ano][uf]) {
      years[ano][uf] = {
        id: `${uf}-${ano}`,
        turno,
        comparecimento: 0,
        removidos: 0,
        perdidos: 0,
        recursados: 0,
        anulados: 0,
        invalidados: 0,
        total: 0,
      };
    }

    const current = years[ano][uf];

    current.comparecimento += comparecimento;
    current.removidos += removidos;
    current.perdidos += totalPerdidos;
    current.recursados += recursados;
    current.anulados += removidos;
    current.invalidados += invalidados;
    current.total += total;
  }

  return years;
};
