import {
  transformEleicoesList,
  transformBoxesTable,
  getTitleTags,
  capitalize,
  transformEleicoesDataList,
  filterExposedByYear,
  filterExposedByUf,
} from '@gavetaio/core';

const transformActionToProblem = (action) => {
  if (action === 'nulled') {
    return 'NULL_BOX';
  }
  if (action === 'exposed') {
    return 'EXPOSED_VOTES';
  }

  if (action === 'size') {
    return 'SIZE_DIFFERENCE';
  }

  if (action === 'manual') {
    return 'MANUAL_COUNT';
  }

  return null;
};

class LocalApi {
  static folder: any;

  static memory: any;

  constructor({ folder, memory }) {
    LocalApi.folder = folder;
    LocalApi.memory = memory;
  }

  get({ action, params = {}, callback }) {
    if (action.match(/get\/election\/.*/gim)) {
      const info = action.split('/');
      const eleicaoIds = info[2].split(',');

      LocalApi.memory.getDataFromIds({ ids: eleicaoIds }, (data) => {
        callback({ upsert: { name: 'elections', data } });
      });

      return;
    }

    if (action === 'get/elections') {
      LocalApi.memory.getElectionList((data) => {
        const result = transformEleicoesList(data);
        const years = getTitleTags(data, 'year', /[a-z]{2}-(.*)-.*/gim);
        const ufs = getTitleTags(data, 'uf', /([a-z]{2})-.*/gim);

        callback({ electionList: { data: result, tags: { years, ufs } } });
      });
      return;
    }

    if (action.match(/get\/boxes/gim)) {
      const info = action.split('/');
      const problem = transformActionToProblem(info[2]);
      const name = `boxes${capitalize(info[2])}`;

      LocalApi.memory.getBoxesByProblem(problem, (data) => {
        try {
          const transformed = transformBoxesTable(data, problem);
          callback({ [`${name}`]: transformed });
        } catch (e) {}
      });
      return;
    }

    if (action === 'get/votes/excluded') {
      LocalApi.memory.getAllElections((data) => {
        const result = transformEleicoesDataList(data);
        const byYear = filterExposedByYear(result);
        const byUf = filterExposedByUf(result);
        callback({ votesExcluded: { byYear, byUf } });
      });
      return;
    }
  }
}

export default LocalApi;
