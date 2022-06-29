import { forEachList } from '../general';

export const getMultipliersFromCargos = (cargos) => {
  const multipliers = {};
  let max = 0;

  forEachList(cargos, (cargo, data) => {
    if (data.total > max) {
      max = data.total;
    }
  });

  forEachList(cargos, (cargo, data) => {
    if (cargo !== 'senador') {
      multipliers[cargo] = 1;
      return;
    }

    if (data.total % max !== 0) {
      const div = data.total / max;
      const decimal = data.total / max - Math.floor(div);
      if (decimal < 0.6) {
        multipliers[cargo] = 1;
        return;
      }
    }

    multipliers[cargo] = Math.round(data.total / max);
  });
  return multipliers;
};

export const getElectionProblemasTags = (election) => {
  const tags = [];
  if (!election?.problemas) {
    return tags;
  }

  const problems = {
    perdidos: 0,
    anulados: 0,
    expostos: 0,
  };

  election.problemas.forEach((problema) => {
    const { type, count } = problema;

    if (type === 'EXPOSED_VOTES') {
      problems.expostos += count;
      return;
    }

    if (type === 'NULL_BOX') {
      problems.perdidos += count;
      return;
    }

    if (type === 'MISSING_VOTES') {
      problems.perdidos += count;
      return;
    }

    if (type === 'SIZE_DIFFERENCE') {
      problems.perdidos += count;
      return;
    }

    if (type === 'COUNT_DIFFERENCE') {
      problems.perdidos += count;
      return;
    }

    tags.push({ label: type, number: count });
  });

  if (problems.expostos) {
    tags.push({ label: 'votos expostos', number: problems.expostos });
  }

  if (problems.anulados) {
    tags.push({ label: 'votos anulados', number: problems.anulados });
  }
  if (problems.perdidos) {
    tags.push({
      type: 'danger',
      label: 'votos perdidos',
      number: problems.perdidos,
    });
  }

  return tags;
};

export const getElectionListItem = (election) => {
  const result = {};

  result.title = election.resumo.id;
  const tags = [];

  let weight = 0;

  if (election.cidades) {
    const keys = Object.keys(election.cidades);
    if (keys.length) {
      tags.push({ number: keys.length, label: 'cidades' });
    }
  }

  if (election.boxes?.sum) {
    tags.push({ number: election.boxes.sum, label: 'seções' });
  }

  if (election.boxes?.insuficientes) {
    const percentage = `${(
      (100 * election.boxes.insuficientes) /
      election.boxes.sum
    ).toFixed(0)}%`;
    if (election.boxes.insuficientes === election.boxes.sum) {
      weight += 1000000;
      tags.push({
        type: 'warning',
        number: percentage,
        label: 'seções insuficientes',
      });
    } else {
      tags.push({ number: percentage, label: 'seções insuficientes' });
    }
  }

  if (election.absolutos?.anulados) {
    weight += election.absolutos.anulados * 100;
    tags.push({
      type: 'danger',
      number: election.absolutos.anulados,
      label: 'anulados',
    });
  }

  if (election.absolutos?.invalidados) {
    weight += election.absolutos.invalidados * 100;
    tags.push({
      type: 'danger',
      number: election.absolutos.invalidados,
      label: 'invalidados',
    });
  }

  if (election.broken) {
    forEachList(election.broken, (cargo, data) => {
      if (cargo === 'void') {
        weight += 1000000000;
        tags.push({
          type: 'danger',
          label: `broken-${cargo}-224-CE`,
        });
        return;
      }
      if (data.revokable) {
        weight += 1000000000;
        tags.push({
          type: 'danger',
          label: `broken-${cargo}-224-CE`,
        });
        return;
      }

      weight += 10000000;
      tags.push({
        type: 'danger',
        label: `broken-${cargo}`,
      });
    });
  }

  tags.push(...getElectionProblemasTags(election));

  result.tags = tags;
  result.weight = weight;
  result.id = election.resumo.id;

  return result;
};

export const transformEleicoesList = (list) => {
  const result = list.map((item) => getElectionListItem(item));
  return result;
};

export const transformEleicoesDataList = (list) => {
  const result = list.map((item) => {
    return {
      resumo: item.resumo,
      multipliers: item.multipliers,
      cargos: item.cargos,
      broken: item.broken,
      absolutos: item.absolutos,
      situacao: item.situacao,
      problemas: item.problemas,
    };
  });
  return result;
};

export const getTitleTags = (
  list = [],
  type = null,
  reg = /[a-z]{2}-(.*)/gim
) => {
  const result = [];

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    const name = item.resumo.id.replace(reg, '$1');
    const find = result.find((tag) => tag.value === name);
    if (!find) {
      if (type === 'year') {
        result.push({ value: name, federal: !item?.multipliers?.prefeito });
        continue;
      }
      result.push({ value: name });
    }
  }
  return result.sort((a, b) => a.value.localeCompare(b.value));
};
