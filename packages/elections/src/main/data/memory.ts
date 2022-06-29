import hadSuplementar from '@gavetaio/engine/src/data/suplementares';
import { isRecursado } from '@gavetaio/core/utils/engine/situations';
import { forEachList, getMultipliersFromCargos } from '@gavetaio/core';
import { loadElectionList, loadFilesFromReg } from './data';

const isInaptoPleito = (atual, pleito) => {
  return (
    pleito.match(/^(indeferido|ren[úu]ncia|cancelado)$/gim) &&
    !atual.match(/^deferido/gim)
  );
};

class DataHandler {
  public cache: any = {};

  public folder: any = '';

  constructor({ folder }) {
    this.cache = {};
    this.folder = folder;
  }

  setFolder(folder) {
    this.folder = folder;
  }

  loadFile() {}

  getElectionsAffected(params, callback) {
    this.getElectionsFull(params, (result) => {});
  }

  getElectionsUnavailable(params, callback) {
    this.getCandidatesFull(params, (result) => {
      const { data } = result;

      const unavailable = {};
      const unavailableList = [];

      if (!data?.length) {
        callback(unavailableList);
        return;
      }

      data.forEach((info) => {
        if (info.situacao <= 1) {
          return;
        }

        if (!unavailable[info.id]) {
          unavailable[info.id] = {};
        }
        if (!unavailable[info.id]?.[info.cargo]) {
          unavailable[info.id][info.cargo] = [];
        }
        unavailable[info.id][info.cargo].push({
          nome: info.nome,
          votos: info.votos,
        });
      });

      const isUnavailable = (info) => {
        if (info.prefeito && info.vereador) {
          return true;
        }
        if (info.senador && Object.keys(info)?.length === 4) {
          return true;
        }
        return false;
      };

      forEachList(unavailable, (id, info) => {
        if (!isUnavailable(info)) {
          return;
        }

        const unavailableElection: any = {
          id,
          cargos: [],
          candidatos: [],
        };

        forEachList(info, (cargo, cargoList) => {
          unavailableElection.cargos.push(cargo);
          unavailableElection.candidatos.push(...cargoList);
        });

        unavailableList.push(unavailableElection);
      });

      callback(unavailableList);
    });
  }

  transformDataFromCandidatos(
    id,
    cargo,
    candidatos,
    result,
    stats,
    broken = null,
    validos,
    suplementar = false,
    type,
    cidade = null
  ) {
    forEachList(candidatos, (nome, detail) => {
      stats.votos += detail.votos;
      stats.candidatos += 1;

      if (detail.raw) {
        const { urna, pleito, atual, totalizacao } = detail.raw;

        const test =
          type === 'recursados'
            ? isRecursado({ urna, pleito, atual })
            : isInaptoPleito(atual, pleito);

        if (test) {
          const r: any = {
            id,
            numero: nome.split('-')[1],
            ...detail,
            cargo,
            percentage: detail.votos / validos,
            broken,
            suplementar,
          };

          if (cidade?.nome) {
            r.cidade = cidade.nome;
          }

          result.push(r);

          stats.irp.candidatos += 1;
          stats.irp.votos += detail.votos;
          if (detail.situacao <= 1) {
            stats.irp.candidatos_sucesso += 1;
            stats.irp.votos_sucesso += detail.votos;
          } else {
            stats.anulados.votos += detail.votos;
            stats.anulados.candidatos += 1;
            stats.irp.candidatos_fail += 1;
            stats.irp.votos_fail += detail.votos;
            if (broken) {
              stats.irp.eleicoes_fail += 1;
            }
          }
        }
      }
    });
  }

  transformRawToElectionList(raw) {
    const result = [];
    const summary = {};
    forEachList(raw, (key, info) => {
      if (!info.eleicao) {
        return;
      }
      const { eleicao, cidades } = info;
      const { resumo, multipliers } = eleicao;
      const { ano, turno } = resumo;

      if (!summary[ano]) {
        summary[ano] = {};
      }

      if (!summary[ano][turno]) {
        summary[ano][turno] = {
          broken: 0,
          elections: 0,
          removidos: 0,
          general: 0,
          urnados: 0,
          recursados: 0,
          votacoes: 0,
          validos: 0,
          cargos: {},
        };
      }

      if (eleicao?.multipliers?.prefeito) {
        forEachList(cidades, (codigo, cidade) => {
          summary[ano][turno].votacoes += 1;

          forEachList(cidade.cargos, (cargo, detail) => {
            if (!summary[ano][turno].cargos[cargo]) {
              summary[ano][turno].cargos[cargo] = {
                broken: 0,
                total: 0,
                validos: 0,
                recursados: 0,
                removidos: 0,
                urnados: 0,
                votacoes: 0,
                brokenRecursados: 0,
                brokenUrnados: 0,
                brokenRemovidos: 0,
              };
            }
            summary[ano][turno].cargos[cargo].validos += detail.validos || 0;
            summary[ano][turno].validos += detail.validos || 0;
            summary[ano][turno].cargos[cargo].recursados +=
              detail.recursados || 0;
            summary[ano][turno].cargos[cargo].removidos +=
              detail.removidos || 0;
            summary[ano][turno].cargos[cargo].votacoes += 1;
            summary[ano][turno].cargos[cargo].urnados += detail.urnados || 0;
          });

          const { broken, absolutos } = cidade;

          if (broken) {
            forEachList(broken, (cargo, detail) => {
              if (detail?.length) {
                detail.forEach((brokenDetail) => {
                  if (brokenDetail.type === 'recursados') {
                    summary[ano][turno].cargos[cargo].brokenRecursados += 1;
                  }
                  if (brokenDetail.type === 'urnados') {
                    summary[ano][turno].cargos[cargo].brokenUrnados += 1;
                  }
                  if (brokenDetail.type === 'removidos') {
                    summary[ano][turno].cargos[cargo].brokenRemovidos += 1;
                  }
                });
              }
              summary[ano][turno].cargos[cargo].broken += 1;
              summary[ano][turno].broken += 1;
            });
          }

          summary[ano][turno].elections += Object.keys(multipliers).length || 0;
          summary[ano][turno].general += Object.keys(multipliers).length || 0;
          summary[ano][turno].removidos += absolutos.removidos || 0;
          summary[ano][turno].recursados += absolutos.recursados || 0;
          summary[ano][turno].urnados += absolutos.urnados || 0;

          if (broken) {
            result.push({ ...cidade, resumo: { codigo, ...eleicao.resumo } });
          }
        });
        return;
      }

      summary[ano][turno].votacoes += 1;

      const { broken, absolutos, cargos } = eleicao;

      forEachList(cargos, (cargo, detail) => {
        if (cargo.match(/presidente/gim)) {
          return;
        }
        if (!summary[ano][turno].cargos[cargo]) {
          summary[ano][turno].cargos[cargo] = {
            broken: 0,
            total: 0,
            validos: 0,
            recursados: 0,
            removidos: 0,
            urnados: 0,
            votacoes: 0,
            brokenRecursados: 0,
            brokenUrnados: 0,
            brokenRemovidos: 0,
          };
        }
        summary[ano][turno].cargos[cargo].validos += detail.validos || 0;
        summary[ano][turno].validos += detail.validos || 0;
        summary[ano][turno].cargos[cargo].recursados += detail.recursados || 0;
        summary[ano][turno].cargos[cargo].removidos += detail.removidos || 0;
        summary[ano][turno].cargos[cargo].urnados += detail.urnados || 0;
        summary[ano][turno].cargos[cargo].votacoes += 1;
      });

      if (broken) {
        forEachList(broken, (cargo, detail) => {
          if (cargo.match(/presidente/gim)) {
            return;
          }
          if (detail?.length) {
            detail.forEach((brokenDetail) => {
              if (brokenDetail.type === 'recursados') {
                summary[ano][turno].cargos[cargo].brokenRecursados += 1;
              }
              if (brokenDetail.type === 'urnados') {
                summary[ano][turno].cargos[cargo].brokenUrnados += 1;
              }
              if (brokenDetail.type === 'removidos') {
                summary[ano][turno].cargos[cargo].brokenRemovidos += 1;
              }
            });
          }
          summary[ano][turno].cargos[cargo].broken += 1;
          summary[ano][turno].broken += 1;
        });
      }

      summary[ano][turno].elections += Object.keys(multipliers).length || 0;
      summary[ano][turno].general += Object.keys(multipliers).length || 0;
      if (multipliers?.presidente) {
        summary[ano][turno].general -= 1;
      }

      summary[ano][turno].validos += absolutos.validos || 0;
      summary[ano][turno].removidos += absolutos.removidos || 0;
      summary[ano][turno].urnados += absolutos.urnados || 0;

      if (broken) {
        result.push(eleicao);
      }
    });
    return { summary, data: result.splice(0, 5000) };
  }

  getBrokenCargosTotal(brokenList) {
    let total = 0;
    if (!brokenList?.length) {
      return total;
    }

    brokenList.forEach(({ broken, type }) => {
      if (broken === true && type === 'recursados') {
        total = 1;
      }
    });

    return total;
  }

  transformRawToCandidateList(raw, params) {
    const result = [];
    const stats = {
      candidatos: 0,
      votos: 0,
      irp: {
        candidatos: 0,
        votos: 0,
        candidatos_sucesso: 0,
        votos_sucesso: 0,
        candidatos_fail: 0,
        votos_fail: 0,
        eleicoes_fail: 0,
      },
      pleitos: {
        total: 0,
        recursados: 0,
        recursadosList: [],
      },
      suplementares: {
        total: 0,
      },
      dxp: {
        candidatos: 0,
        votos: 0,
        candidatos_sucesso: 0,
        votos_sucesso: 0,
        candidatos_fail: 0,
        votos_fail: 0,
      },
      anulados: {
        candidatos: 0,
        votos: 0,
        iru: 0,
        irp: 0,
        na: 0,
        pa: 0,
        naVotos: 0,
        paVotos: 0,
      },
      positivados: {
        na: 0,
        naVotos: 0,
        pa: 0,
        paVotos: 0,
      },
    };

    forEachList(raw, (key, info) => {
      if (params.ano && !key.match(new RegExp(`${params.ano}`, 'mig'))) {
        return;
      }

      if (info.eleicao.resumo.turno !== '1') {
        return;
      }

      if (!info.candidatos) {
        forEachList(info.cidades, (codigo, cidade) => {
          let withSuplementar = false;

          forEachList(cidade.candidatos, (cargo, detail) => {
            if (
              params.cargo &&
              !cargo.match(new RegExp(`${params.cargo}`, 'mig'))
            ) {
              return;
            }

            stats.pleitos.total += 1;

            const recursados: any = this.getBrokenCargosTotal(
              cidade.broken?.[cargo]
            );

            if (recursados) {
            }

            stats.pleitos.recursados += recursados;

            let suplementar = false;

            if (cargo === 'prefeito') {
              suplementar = hadSuplementar({
                scope: cidade.nome,
                ano: info.eleicao.resumo.ano,
                cargo,
              });
            }

            if (suplementar) {
              withSuplementar = true;
            }

            const validos =
              (cidade.cargos[cargo].validos || 0) +
              (cidade.cargos[cargo].removidos || 0);

            this.transformDataFromCandidatos(
              `${key}-${codigo}`,
              cargo,
              detail,
              result,
              stats,
              cidade.broken?.[cargo],
              validos,
              suplementar,
              params.type,
              cidade
            );
          });

          if (withSuplementar) {
            stats.suplementares.total += 1;
          }
        });
        return;
      }

      forEachList(info.candidatos, (cargo, detail) => {
        if (
          params.cargo &&
          !cargo.match(new RegExp(`${params.cargo}`, 'mig'))
        ) {
          return;
        }

        stats.pleitos.total += 1;

        const recursados: any = this.getBrokenCargosTotal(
          info.eleicao.broken?.[cargo]
        );

        if (recursados) {
          stats.pleitos.recursadosList.push({
            id: info.eleicao.resumo.id,
            broken: info.eleicao.broken[cargo],
          });
        }

        stats.pleitos.recursados += recursados;

        const validos =
          (info.eleicao.cargos[cargo].validos || 0) +
          (info.eleicao.cargos[cargo].removidos || 0);

        let suplementar = false;

        if (cargo.match(/governador|senador/gim)) {
          suplementar = hadSuplementar({
            scope: info.eleicao.resumo.uf,
            ano: info.eleicao.resumo.ano,
            cargo,
          });
        }

        this.transformDataFromCandidatos(
          `${key}`,
          cargo,
          detail,
          result,
          stats,
          info.eleicao?.broken?.[cargo],
          validos,
          suplementar,
          params.type
        );
      });
    });

    const filtered = result
      .sort((a, b) => b.votos - a.votos)

      .splice(0, 1200);

    return { ...stats, data: filtered };
  }

  getCandidatesFull(params, callback) {
    let filters = 'candidates';

    if (params.ano) {
      filters += `.${params.ano}`;
    }
    if (params.cargo) {
      filters += `.${params.cargo}`;
    }
    if (params.type) {
      filters += `.${params.type}`;
    }

    const cachedVersion = this.getCached({ id: 'general', type: filters });
    if (cachedVersion) {
      callback(cachedVersion);
      return;
    }

    const reg = /^[a-z]{2}-[0-9]{4}-1.*/gim;

    loadFilesFromReg({
      folder: this.folder,
      reg,
      callback: (result) => {
        try {
          this.setCache({
            id: 'general',
            type: filters,
            data: this.transformRawToCandidateList(result, params),
          });
        } catch (e) {}

        callback(this.getCached({ id: 'general', type: filters }));
      },
    });
  }

  getElectionsFull(params, callback) {
    const reg =
      /^([a-z]{2}-[0-9]{4}-[0-9]{1}\.json|[a-z]{2}-[0-9]{4}-[0-9]{1}-cidades.json)/gim;
    const type = 'elections';
    loadFilesFromReg({
      folder: this.folder,
      reg,
      callback: (result) => {
        try {
          this.setCache({
            id: 'general',
            type,
            data: this.transformRawToElectionList(result),
          });
        } catch (e) {}
        callback(this.getCached({ id: 'general', type }));
      },
    });
  }

  getDataFromIds(params, callback) {
    if (!params?.ids?.length) {
      return;
    }

    params.ids.forEach((id, index) => {
      const reg = params.reg || new RegExp(`${id}(.*)`, 'mig');

      if (!reg) {
        return;
      }

      const cached = this.getCached({ id });
      if (cached && cached.candidatos) {
        callback({ [`${id}`]: cached });
        return;
      }

      loadFilesFromReg({
        folder: this.folder,
        reg,
        callback: (result) => {
          forEachList(result, (key, info) => {
            forEachList(info, (type, data) => {
              this.setCache({
                id: key,
                type,
                data,
              });
            });
          });

          callback({ [`${id}`]: this.getCached({ id }) });
        },
      });
    });
  }

  getCached({ id, type = null }) {
    if (!id) {
      return this.cache || null;
    }

    if (!this.cache[id]) {
      return null;
    }

    if (!type) {
      return this.cache[id] || null;
    }

    if (!this.cache[id][type]) {
      return null;
    }

    return this.cache[id][type];
  }

  getCachedElectionList() {
    const result = [];
    forEachList(this.cache, (id, data) => {
      if (data.eleicao) {
        result.push(data.eleicao);
      }
    });
    return result;
  }

  setCache({ id, type, data }) {
    if (!this.cache[id]) {
      this.cache[id] = {};
    }
    this.cache[id].date = new Date().getTime();
    this.cache[id][type] = data;
  }

  unsetCache({ id, type }: any = {}) {
    if (id && type) {
      this.cache[id][type] = null;
    }
    if (id) {
      this.cache[id] = null;
    }

    this.cache = {};
  }

  filterBoxesByProblem(data, problem) {
    const result = [];
    const reg = new RegExp(problem, 'mig');

    const boxes = [];

    forEachList(data, (id, list) => {
      if (!list?.boxes) {
        return;
      }
      boxes.push(...list.boxes);
    });

    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];

      if (!box?.problemas && !box?.warnings) {
        continue;
      }

      if (problem === 'MANUAL_COUNT' && box.manual) {
        result.push(box);
        continue;
      }

      if (box?.problemas?.length) {
        for (let k = 0; k < box.problemas.length; k += 1) {
          if (
            typeof box.problemas[k] === 'string' &&
            box.problemas[k].match(reg)
          ) {
            result.push(box);
            break;
          }

          if (box.problemas[k]?.type && box.problemas[k].type.match(reg)) {
            result.push(box);
            break;
          }
        }
      }
    }

    return result;
  }

  getBoxesByProblem(problem, callback) {
    const reg = /boxes/gim;
    loadFilesFromReg({
      folder: this.folder,
      reg,
      callback: (result) => {
        const boxes = this.filterBoxesByProblem(result, problem);

        callback(boxes);
      },
    });
  }

  transformFederalToFlatList({ eleicao }) {
    const result = [];
    const election: any = {};
    election.resumo = eleicao.resumo;
    election.boxes = eleicao.boxes;
    election.absolutos = eleicao.absolutos;
    election.cargos = eleicao.cargos;
    election.partidos = eleicao.partidos;
    election.candidatos = eleicao.candidatos;
    election.multipliers = eleicao.multipliers;
    election.coligs = eleicao.coligs;
    election.resumo.federal = true;
    result.push(election);
    return result;
  }

  transformMunicipalToFlatList({ eleicao, cidades }) {
    const result = [];
    const { uf, ano, turno, id } = eleicao.resumo;
    forEachList(cidades, (codigo, cidade) => {
      const election: any = {};
      election.resumo = {
        uf,
        ano,
        turno,
        codigo: codigo,
        id: `${id}-${codigo}`,
        federal: false,
      };
      election.absolutos = cidade.absolutos;
      election.cargos = cidade.cargos;
      election.boxes = cidade.boxes;
      election.partidos = cidade.partidos;
      election.candidatos = cidade.candidatos;
      election.multipliers = getMultipliersFromCargos(cidade.cargos);
      election.coligs = cidade.coligs;
      election.resumo.municipio = cidade.nome;

      result.push(election);
    });
    return result;
  }

  transformRawToFlattenElections(raw) {
    const result = [];
    forEachList(raw, (key, info) => {
      if (!info.eleicao) {
        return;
      }
      const { eleicao, cidades } = info;

      let data = [];

      if (eleicao?.multipliers?.prefeito || eleicao?.multipliers?.vereador) {
        data = this.transformMunicipalToFlatList({ eleicao, cidades });
      } else {
        data = this.transformFederalToFlatList({ eleicao });
      }
      result.push(...data);
    });
    return result;
  }

  transformMunicipalToFlatCityList({ eleicao, cidades }) {
    const result = [];
    const { uf, ano, turno, id } = eleicao.resumo;
    const { multipliers } = eleicao;

    forEachList(cidades, (codigo, cidade) => {
      let comparecimento = 0;

      if (cidade?.comparecimento) {
        comparecimento = cidade.comparecimento;
      }

      if (!comparecimento && cidade?.cargos) {
        if (cidade.cargos.prefeito) {
          comparecimento = cidade.cargos.prefeito.total;
        } else if (cidade.cargos.presidente) {
          comparecimento = cidade.cargos.presidente.total;
        } else if (cidade.cargos.presidente) {
          comparecimento = cidade.cargos.presidente.total;
        }
      }

      const federal = !(multipliers?.prefeito || multipliers?.vereador);

      const election: any = {};
      election.resumo = {
        uf,
        ano,
        turno,
        codigo,
        comparecimento,
        municipio: cidade.nome,
        id: `${id}-${codigo}`,
        federal,
      };
      election.cargos = cidade.cargos;
      if (cidade.voting) {
        election.voting = cidade.voting;
      }
      result.push(election);
    });
    return result;
  }

  transformRawToFlattenCities(raw) {
    const result = [];
    forEachList(raw, (key, info) => {
      if (!info.eleicao) {
        return;
      }
      const { eleicao, cidades } = info;

      result.push(
        ...this.transformMunicipalToFlatCityList({ eleicao, cidades })
      );
    });
    return result;
  }

  getAllElections(callback) {
    const reg =
      /^([a-z]{2}-[0-9]{4}-[0-9]{1}\.json|[a-z]{2}-[0-9]{4}-[0-9]{1}-cidades.json)/gim;
    const type = 'elections-all';

    const cached = this.getCached({ id: 'general', type });
    if (cached) {
      callback(cached);
      return;
    }

    loadFilesFromReg({
      folder: this.folder,
      reg,
      callback: (result) => {
        try {
          this.setCache({
            id: 'general',
            type,
            data: this.transformRawToFlattenElections(result),
          });
        } catch (e) {}
        callback(this.getCached({ id: 'general', type }));
      },
    });
  }

  getAllElectionsCities(callback) {
    const reg =
      /^([a-z]{2}-[0-9]{4}-[0-9]{1}\.json|[a-z]{2}-[0-9]{4}-[0-9]{1}-cidades.json)/gim;
    const type = 'elections-cities';

    const cached = this.getCached({ id: 'general', type });
    if (cached) {
      callback(cached);
      return;
    }

    loadFilesFromReg({
      folder: this.folder,
      reg,
      callback: (result) => {
        try {
          this.setCache({
            id: 'general',
            type,
            data: this.transformRawToFlattenCities(result),
          });
        } catch (e) {}
        callback(this.getCached({ id: 'general', type }));
      },
    });
  }

  getElectionList(callback, resetCache = false) {
    if (!resetCache) {
      const list = this.getCachedElectionList();

      if (list?.length) {
        callback(list);
        return;
      }
    } else {
      this.unsetCache();
    }

    loadElectionList({
      folder: this.folder,
      callback: (result) => {
        forEachList(result, (id, data) => {
          forEachList(data, (type, content) => {
            this.setCache({ id, type, data: content });
          });
        });
        callback(this.getCachedElectionList());
      },
    });
  }
}

export default DataHandler;
