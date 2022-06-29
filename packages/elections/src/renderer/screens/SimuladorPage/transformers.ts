import { deepClone, forEachList, forEachListBreakable } from '@gavetaio/core';
import { PARTIDOS } from '@gavetaio/engine/src/constants';

const CARGO_LABEL = {
  cargos: {
    senador: 'Senador',
    deputado_federal: 'Deputado Federal',
    deputado_estadual: 'Deputado Estadual',
    vereador: 'Vereador',
    prefeito: 'Prefeito',
    governador: 'Governador',
    presidente: 'Presidente',
  },
};

const WEIGHT = {
  senador: 3,
  deputado_federal: 2,
  deputado_estadual: 1,
  vereador: 1,
  prefeito: 2,
  governador: 4,
  presidente: 5,
};

export const transformEleicao = ({ candidatos, multipliers }) => {
  const settings = [];
  const candidatosList = [];
  const partidosList = [];

  forEachList(multipliers, (cargo, value) => {
    const item: any = {};

    item.cargo = cargo;
    item.label = CARGO_LABEL.cargos[cargo];
    item.legenda = !!cargo.match(/vereador|deputado/gim);

    forEachListBreakable(candidatos[cargo], (candidato) => {
      const split = candidato.split('-');
      item.digitos = split[1].length;
      return true;
    });

    for (let i = 0; i < value; i += 1) {
      const cloned = deepClone(item);
      if (value > 1) {
        cloned.label = `${cloned.label} — ${i + 1}ª vaga`;
      }
      cloned.id = `${cloned.cargo}_${i}`;
      settings.push(cloned);
    }

    forEachListBreakable(candidatos[cargo], (candidato, data) => {
      const candidatoObject: any = {};
      const nomeSplit = candidato.split('-');
      const numero = nomeSplit[1];
      const partido = numero.slice(0, 2);

      candidatoObject.nome = data?.nome || candidato;
      candidatoObject.numero = numero;
      candidatoObject.partido = partido;
      candidatoObject.cargo = cargo;
      candidatoObject.genero = data.genero || 2;
      candidatoObject.situacao = data.situacao || 0;
      candidatoObject.extras = data?.extras || null;
      candidatoObject.image = 'https://gaveta.io';

      candidatosList.push(candidatoObject);
      return true;
    });

    forEachListBreakable(candidatos[cargo], (candidato, data) => {
      const candidatoObject: any = {};
      const nomeSplit = candidato.split('-');
      const numero = nomeSplit[1];
      const partido = numero.slice(0, 2);

      if (!partidosList.find((info) => info.numero === partido)) {
        const partidoData = PARTIDOS.find((info) => info.numero === partido);

        const partidoItem = {
          nome: partidoData?.sigla || partido,
          numero: partido,
        };
        partidosList.push(partidoItem);
      }

      candidatoObject.nome = data?.nome || candidato;
      candidatoObject.numero = numero;
      candidatoObject.partido = partido;
      candidatoObject.cargo = cargo;
      candidatoObject.genero = data.genero || 2;
      candidatoObject.situacao = data.situacao || 0;
      candidatoObject.extras = data?.extras || null;
      candidatoObject.image = 'https://gaveta.io';

      candidatosList.push(candidatoObject);
      return false;
    });
  });

  settings.sort((a, b) => WEIGHT[a.cargo] - WEIGHT[b.cargo]);

  return { settings, candidatos: candidatosList, partidos: partidosList };
};
