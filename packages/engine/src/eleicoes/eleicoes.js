const {
  getBoxHeaders,
  forEachList,
  getBallotTree,
  objectToArray,
  getMissingCandidates,
  getNumber,
} = require("./helpers");
const investigations = require("./investigations");
const { deepClone } = require("../utils");
const { LoggerSingleton } = require("../log");
const { RESULTADO } = require("./constants");
const { printBallots } = require("./printer");

const { log } = LoggerSingleton.getInstance();

export class Election {
  resetAccumulator(headers = {}) {
    log("RESETING ACCUMULATOR", { emoji: "🏭" });

    if (headers?.local) {
      log("LOCAL ELECTION DETECTED", { emoji: "🏭" });
    }

    const resultado = deepClone(RESULTADO);
    const turno_1 = deepClone(resultado);
    const turno_2 = deepClone(resultado);

    if (headers) {
      this.headers = deepClone(headers);
    }

    this.cidades = [];
    this.suplementares = [];
    this.checkPresident = null;
    this.cache = {};
    this.situacoes = {};
    this.accumulator = {
      resultados: {
        turno_1,
        turno_2,
      },
      boxes: {},
      cesc: {},
      coligacoes: {},
      headers: deepClone(headers),
    };
  }

  setLogger(logger) {
    this.log = logger;
  }

  printer({ type = "", extra, removed }) {
    if (type === "print_ballots") {
      printBallots({
        accumulator: this.accumulator,
        extra,
        removed,
        getParentData: (data) => this.getParentData(data),
      });
    }
  }

  setHeaders(headers) {
    this.accumulator = {
      ...this.accumulator,
      ...headers,
    };
  }

  getCandidatos(turno = 1) {
    if (!this.accumulator.resultados[`turno_${turno}`]) {
      return [];
    }

    const keys = Object.keys(
      this.accumulator.resultados[`turno_${turno}`].candidatos
    );
    return keys;
  }

  getBoxSize(box) {
    const cargos = box.cargos;
    let max = 0;

    forEachList(cargos, (cargo, data) => {
      if (cargo === "senador") {
        return;
      }
      if (data.total > max) {
        max = data.total;
      }
    });

    return max;
  }

  getResult({ turno, path }) {
    const tree = path.split(".");
    let element = this.accumulator.resultados[`turno_${turno}`];
    for (let i = 0; i < tree.length; i += 1) {
      if (element[tree[i]]) {
        element = element[tree[i]];
        continue;
      }
      element = null;
    }
    return element;
  }

  updateLargestBox({ turno, id, size }) {
    const result = this.getResult({ turno, path: "boxes.maior" });
    if (!result.tamanho || size > result.tamanho) {
      result.box = id;
      result.tamanho = size;
    }
  }

  updateSmallestBox({ turno, id, size }) {
    const result = this.getResult({ turno, path: "boxes.menor" });
    if (!result.tamanho || size < result.tamanho) {
      result.box = id;
      result.tamanho = size;
    }
  }

  getOtherTermBox(box) {
    const { id } = box;
    const otherTurno = box.turno === "1" ? "2" : "1";
    const reg = new RegExp(`-${box.turno}-`, "mig");
    const otherId = id.replace(reg, `-${otherTurno}-`);
    const otherBox = this.accumulator.boxes[otherId];
    return otherBox || null;
  }

  cloneCargos({ cargos, onClone }) {
    forEachList(cargos, (cargo, data) => {
      forEachList(data, (key, value) => {
        onClone({
          cargo,
          key,
          value,
        });
      });
    });
  }

  cloneValidos({ validos, onClone }) {
    if (!validos?.length) {
      return;
    }
    for (let i = 0; i < validos; i += 1) {
      onClone({ ...validos[i] });
    }
  }

  updateScopeInfo(box) {
    const { scope, turno, absolutos } = box;

    this.setResult({
      turno,
      scope,
      path: `absolutos.comparecimento`,
      add: absolutos.tamanho,
    });

    if (scope) {
      this.setResult({
        turno,
        scope,
        path: `nome`,
        value: box.municipio,
        scoped: true,
      });

      this.setResult({
        turno,
        scope,
        path: `comparecimento`,
        add: box.absolutos.tamanho,
        scoped: true,
      });

      if (box.absolutos.aptos) {
        this.setResult({
          turno,
          scope,
          path: `aptos`,
          add: box.absolutos.aptos,
          scoped: true,
        });
      }
      return;
    }

    this.setResult({
      turno,
      scope,
      path: `cidades.${box.codigo}.nome`,
      data: [
        {
          path: "nome",
          value: box.municipio,
        },
        {
          path: "comparecimento",
          add: box.absolutos.tamanho,
        },
      ],
      value: box.municipio,
    });

    if (box.absolutos.aptos) {
      this.setResult({
        turno,
        scope,
        path: `cidades.${box.codigo}.aptos`,
        add: box.absolutos.aptos,
        scoped: true,
      });
    }

    this.cloneCargos({
      cargos: box.cargos,
      onClone: ({ cargo, key, value }) => {
        this.setResult({
          turno: box.turno,
          scope: box.scope,
          path: `cidades.${box.codigo}.cargos.${cargo}.${key}`,
          add: value,
        });
      },
    });

    this.cloneValidos({
      validos: box.validos,
      onClone: ({ nome, votos }) => {
        this.setResult({
          turno: box.turno,

          path: `cidades.${box.codigo}.candidatos.${
            nome.split("-")[0]
          }.${nome}`,
          add: votos,
        });
      },
    });
  }

  updateZoneInfo(box) {
    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `zonas.${box.zona}.tamanho`,
      add: box.absolutos.tamanho,
    });

    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `zonas.${box.zona}.secoes`,
      add: 1,
    });

    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `zonas.${box.zona}.boxes`,
      push: {
        id: box.id,
        size: box.absolutos.tamanho,
      },
    });

    this.cloneCargos({
      cargos: box.cargos,
      onClone: ({ cargo, key, value }) => {
        this.setResult({
          scope: box.scope,
          turno: box.turno,
          path: `zonas.${box.zona}.cargos.${cargo}.${key}`,
          add: value,
        });
      },
    });
  }

  checkBoxUnvoted(box, candidatos) {
    const missing = getMissingCandidates({
      box,
      candidatos: candidatos[box.turno],
    });

    if (missing && missing.length) {
      this.setBallot({
        name: box.id,
        path: "absolutos.votados",
        add: candidatos[box.turno].length - missing.length,
      });
    }
  }

  checkMultipliers(box) {
    const { turno, scope } = box;
    if (this.accumulator.resultados[`turno_${turno}`].multipliers) {
      return true;
    }

    const multipliers = this.getBoxMultipliers(box);

    if (!multipliers) {
      throw "#45689";
      return false;
    }

    this.setResult({
      turno,
      scope,
      path: "multipliers",
      value: multipliers,
    });
    return true;
  }

  updatePoolstationSize({ id, size }) {
    if (size === 1) {
      log(["SINGULAR VOTER", id], {
        emoji: "🧨",
      });
    }
    this.setBallot({
      name: id,
      path: "absolutos.tamanho",
      value: size,
    });
  }

  updateInvalidBox(box) {
    if (!box.absolutos.invalido) {
      return;
    }

    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `boxes.invalidas`,
      push: {
        id: box.id,
        count: box.absolutos.invalido,
      },
    });
  }

  updateBoxCount(box) {
    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `boxes.sum`,
      add: 1,
    });
  }

  updateInsuficientCount(box) {
    const count = box.absolutos.tamanho;
    if (count >= 300) {
      return;
    }

    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `boxes.insuficientes`,
      add: 1,
    });
  }

  updateSmallestList(box) {
    const count = box.absolutos.tamanho;

    if (count > 50 * 0.7) {
      return;
    }

    this.setResult({
      turno: box.turno,
      scope: box.scope,
      path: `boxes.menores`,
      push: {
        id: box.id,
        count,
        extra: {
          codigo: box.codigo,
          aptos: box.absolutos?.aptos || null,
        },
      },
    });
  }

  checkManualCount(box) {
    const {
      turno,
      scope,
      id,
      absolutos,
      abertura,
      encerramento,
      junta_apuradora,
    } = box;

    if (!junta_apuradora) {
      return;
    }

    if (abertura || encerramento || !junta_apuradora) {
      if (junta_apuradora) {
        log(`${id} ${abertura} ${encerramento} ${junta_apuradora}`);
      }
    }

    this.setResult({
      turno,
      scope,
      path: `warnings`,
      push: {
        id,
        type: "MANUAL_COUNT",
        count: absolutos.total,
      },
    });

    this.setBallot({
      id,
      path: `manual`,
      value: true,
    });
  }

  updateBallotInfo({ box, candidatos }) {
    const size = this.getBoxSize(box);
    const turno = `${box.turno}`;
    const { id } = box;
    const { resultados } = this.accumulator;

    this.updatePoolstationSize({ id, size });
    this.checkBoxUnvoted(box, candidatos);
    this.updateInvalidBox(box);

    this.updateLargestBox({ turno, id, size });
    this.updateSmallestBox({ turno, id, size });

    this.updateBoxCount(box);
    this.updateSmallestList(box);
    this.updateInsuficientCount(box);

    this.checkManualCount(box);
    this.updateScopeInfo(box);
    this.updateZoneInfo(box);
  }

  getBoxMultipliers(box) {
    if (!box.cargos || !Object.keys(box.cargos).length) {
      return false;
    }

    const cargos = this.getParentData({
      turno: box.turno,
      scope: box.scope,
      path: "cargos",
    });

    const size = this.getBoxSize(box);
    if (Object.keys(cargos).length !== Object.keys(box.cargos).length) {
      throw "#546789";
      return false;
    }

    const multipliers = {};
    let done = 0;
    forEachList(box.cargos, (cargo, data) => {
      if (cargo !== "senador") {
        multipliers[cargo] = 1;
        done += 1;
        return;
      }

      if (data.total % size !== 0) {
        const div = data.total / size;
        const dec = div - Math.floor(div);
        if (dec < 0.6) {
          return;
        }
      }

      multipliers[cargo] = Math.round(data.total / size);
      done += 1;
    });

    if (done !== Object.keys(cargos).length) {
      throw `#7867: ${size}`;
      return false;
    }

    return multipliers;
  }

  setMultipliersFromBoxes(boxes) {
    for (let i = 0; i < boxes.length; i += 1) {
      if (!this.checkMultipliers(boxes[i])) {
        if (
          this.accumulator.resultados.turno_1.multipliers &&
          this.accumulator.resultados.turno_2.multipliers
        ) {
          break;
        }
      }
    }
  }

  runInvestigations() {
    log("RUNNING INVESTIGATIONS", { emoji: "🏭" });
    const investigationData = {
      accumulator: this.accumulator,
      resultados: this.accumulator.resultados,
      boxes: this.accumulator.boxes,
      cesc: this.accumulator.cesc,
      suplementares: this.suplementares,
      callback: (info) => this.pushGeneral(info),
      getParentData: (data) => this.getParentData(data),
      setBox: (data) => this.checkBallot(data),
    };

    if (this.accumulator.headers.presiential) {
      return null;
    }

    investigations(investigationData);
  }

  updateGeneralInfo() {
    const boxes = objectToArray(this.accumulator.boxes);
    const candidatos = {
      1: this.getCandidatos(1),
      2: this.getCandidatos(2),
    };

    if (!boxes?.length) {
      return;
    }

    this.setMultipliersFromBoxes(boxes);

    log("REFACTORING BOXES", { emoji: "🏭" });
    for (let i = 0; i < boxes.length; i += 1) {
      this.updateBallotInfo({ box: boxes[i], candidatos });
    }

    this.runInvestigations();
  }

  getParentData({ turno, path, scope }) {
    const { tree } = getBallotTree({ path, scope });
    let element = this.accumulator.resultados[`turno_${turno}`];
    for (let index = 0; index < tree.length; index += 1) {
      element = element[tree[index]];

      if (!element) {
        return element;
      }
    }
    return element;
  }

  getBoxData({ id, path }) {
    let element = this.accumulator.boxes[id];
    if (!element) {
      return null;
    }
    const { tree } = getBallotTree({ path });
    for (let index = 0; index < tree.length; index += 1) {
      element = element[tree[index]];
      if (!element) {
        return element;
      }
    }
    return element;
  }

  setTreeElement({ root, tree }) {
    let path = "";
    for (let index = 0; index < tree.length; index += 1) {
      path = tree[index];
      if (index === tree.length - 1) {
        break;
      }

      if (typeof root[path] === "undefined") {
        root[path] = {};
      }

      root = root[path];
    }

    return { root, path };
  }

  pushTreeValue(params) {
    const { value, add, push, unique, limit, data, root, path, merge } = params;

    if (add !== undefined) {
      if (!root[path]) {
        root[path] = add;
        return;
      }
      root[path] += add;
      return;
    }
    if (value !== undefined) {
      root[path] = value;
      return;
    }
    if (push !== undefined) {
      if (!root[path]) {
        root[path] = [push];
        return;
      }
      root[path].push(push);
      return;
    }
    if (unique !== undefined) {
      if (!root[path]) {
        root[path] = [unique];
        return;
      }
      if (root[path].indexOf(unique) === -1) {
        if (!limit || root[path].length < limit) {
          root[path].push(unique);
        }
      }
    }
    if (merge !== undefined) {
      if (!root[path]) {
        root[path] = merge;
        return;
      }
      root[path] = {
        ...root[path],
        merge,
      };
      return;
    }
    if (data?.length) {
      data.forEach((info) => {
        this.pushTreeValue({ root, ...info });
      });
    }
  }

  setTreeValue({ root, tree, prefix, treeString, structured }) {
    if (!tree?.length) {
      return;
    }

    const result = this.setTreeElement({ root, tree });

    this.pushTreeValue({
      root: result.root,
      path: result.path,
      ...structured,
    });
  }

  setResult({
    turno,
    path = "",
    value,
    add,
    push,
    data,
    unique,
    merge,
    limit = 0,
    scope = null,
    scoped = false,
  }) {
    const structured = {
      value,
      add,
      push,
      data,
      unique,
      limit,
      merge,
    };

    if (scope) {
      const { tree, treeString } = getBallotTree({ path, scope });
      let root = this.accumulator.resultados[`turno_${turno}`];
      this.setTreeValue({
        root,
        tree,
        prefix: `resultados.turno_${turno}`,
        treeString,
        structured,
      });

      if (scoped) {
        return;
      }
    }

    const { tree, treeString } = getBallotTree({ path });
    let root = this.accumulator.resultados[`turno_${turno}`];
    this.setTreeValue({
      root,
      tree,
      prefix: `resultados.turno_${turno}`,
      treeString,
      structured,
    });
  }

  setBallot({ name, id, path, value, add, push, data, merge, unique, limit }) {
    const { tree, treeString } = getBallotTree({ path });
    const structured = {
      value,
      add,
      push,
      data,
      unique,
      merge,
      limit,
    };
    let root = this.accumulator.boxes[name || id];
    this.setTreeValue({
      root,
      tree,
      prefix: `boxes.${name || id}`,
      treeString,
      structured,
    });
  }

  setCesc({ id, path, value, add, push }) {
    const { tree, treeString } = getBallotTree({ path });
    let root = this.accumulator.cesc[id];
    const structured = {
      value,
      add,
      push,
    };
    this.setTreeValue({
      root,
      tree,
      prefix: `cesc.${id}`,
      treeString,
      structured,
    });
  }

  setColig({ id, path, value, add, push }) {
    const { tree, treeString } = getBallotTree({ path });
    const structured = {
      value,
      add,
      push,
    };

    this.setTreeValue({
      root: this.accumulator.colig[id],
      tree,
      prefix: `colig.${id}`,
      treeString,
      structured,
    });
  }

  checkBallot({ id, upsert }) {
    if (this.accumulator.boxes[id]) {
      return this.accumulator.boxes[id];
    }

    const result = {
      ...upsert,
    };
    if (!result.absolutos) {
      result.absolutos = {};
    }
    this.accumulator.boxes[id] = result;
    return this.accumulator.boxes[id];
  }

  checkCesc({ id, upsert }) {
    if (this.accumulator.cesc[id]) {
      this.accumulator.cesc[id] = upsert;
      return this.accumulator.cesc[id];
    }

    this.accumulator.cesc[id] = upsert;
    return this.accumulator.cesc[id];
  }

  checkColig({ id, upsert, shouldReplace }) {
    const turno = `turno_${upsert.turno}`;
    if (
      this.accumulator.resultados[turno] &&
      this.accumulator.resultados[turno].coligacoes[id] &&
      !shouldReplace
    ) {
      return this.accumulator.resultados[turno].coligacoes[id];
    }
    this.accumulator.resultados[turno].coligacoes[id] = upsert;
    return this.accumulator.resultados[turno].coligacoes[id];
  }

  pushGeneral({
    id,
    turno,
    path,
    data,
    add,
    push,
    value,
    merge,
    scope,
    unique,
    limit,
    scoped = false,
  }) {
    if (turno) {
      this.setResult({
        turno,
        path,
        add,
        push,
        value,
        merge,
        data,
        scope,
        scoped,
        unique,
        limit,
      });
    }
    if (id) {
      this.setBallot({
        id,
        path,
        add,
        push,
        value,
        merge,
        data,
        unique,
        limit,
      });
    }
  }

  isCountryCodeWithinScope(data) {
    if (!this.accumulator?.headers?.uf) {
      return false;
    }

    const codigo = `${getNumber(data.CD_MUNICIPIO || data.SG_UE || 0)}`;

    if (codigo && this.cidades.indexOf(codigo) === -1) {
      return false;
    }

    if (this.checkPresident === true && data.NR_ZONA) {
      data.SG_UF = null;
      return false;
    }

    data.SG_UF = this.accumulator.headers.uf;
    data.IS_BR = true;

    return true;
  }

  setupLinePopulation(transformed) {
    const {
      VOTAVEL_TIPO,
      MUNICIPIO,
      CODIGO_MUNICIPIO,
      APTOS,
      URNA,
      ABERTURA,
      ENCERRAMENTO,
      COMPARECIMENTOS,
      NUMERO,
      TURNO,
      URNA_TIPO,
      ZONA,
      SECAO,
      CARGO,
      CANDIDATO,
      ID,
      UF,
      PARTIDO,
      COUNT,
      SCOPE,
      BIOMETRIA,
      JUNTA_APURADORA,
      LOCAL_VOTACAO,
      IS_CESC,
      IS_COLIG,
      IS_COLIG_INFO,
      IS_SUPLEMENTAR,
      IS_BR,
    } = transformed;

    if (IS_SUPLEMENTAR) {
      if (CODIGO_MUNICIPIO) {
        this.suplementares[CODIGO_MUNICIPIO] = transformed;
      }
      return false;
    }

    if (IS_CESC) {
      this.checkCesc({
        id: transformed.ID,
        upsert: {
          secao: transformed.SECAO,
          zona: transformed.ZONA,
          municipio: transformed.MUNICIPIO,
        },
      });

      return false;
    }

    if (IS_COLIG) {
      if (!transformed.ID) {
        return false;
      }

      const upsert = {
        coligacao: transformed.COLIGACAO,
        etnia: transformed.ETNIA,
        resultado: transformed.RESULTADO,
        situacao: transformed.SITUACAO,
        genero: transformed.GENERO,
        grau: transformed.GRAU,
        urna: transformed.URNA,
        pleito: transformed.PLEITO,
        atual: transformed.ATUAL,
        totalizacao: transformed.TOTALIZACAO,
        idade: transformed.IDADE,
        nome: transformed.NOME,
        turno: TURNO,
      };

      this.checkColig({
        id: transformed.ID,
        shouldReplace: transformed.SHOULD_REPLACE,
        upsert,
      });

      return false;
    }

    if (IS_COLIG_INFO) {
      this.setResult({
        turno: TURNO,
        scope: SCOPE,
        path: `coligsInfo.${CARGO}.${PARTIDO}`,
        value: transformed.SITUACAO,
        scoped: true,
      });

      return false;
    }

    if (!TURNO || !ZONA || !SECAO || !UF || !CODIGO_MUNICIPIO) {
      throw "#45678";
    }

    if (this.cidades.indexOf(CODIGO_MUNICIPIO) === -1) {
      this.cidades.push(CODIGO_MUNICIPIO);
    }

    if (!CANDIDATO && NUMERO && !NUMERO.match(/^(95|96|97)$/)) {
      throw "#28734";
    }

    if (this.checkPresident === null && CARGO === "presidente") {
      if (IS_BR === true) {
        this.checkPresident = false;
      }
      this.checkPresident = true;
    }

    return true;
  }

  populateFromLine(data) {
    const transformed = deepClone(
      getBoxHeaders(
        data,
        this.accumulator.headers.uf,
        this.accumulator.headers.federal
      )
    );

    if (!transformed?.UF) {
      if (
        !(
          transformed.UF !== this.accumulator.headers.uf &&
          this.accumulator.headers.presidential
        )
      ) {
        return;
      }
    }

    const {
      VOTAVEL_TIPO,
      MUNICIPIO,
      CODIGO_MUNICIPIO,
      APTOS,
      URNA,
      ABERTURA,
      ENCERRAMENTO,
      ID,
      UF,
      COMPARECIMENTOS,
      NUMERO,
      TURNO,
      URNA_TIPO,
      ZONA,
      SECAO,
      CARGO,
      CANDIDATO,
      PARTIDO,
      COUNT,
      SCOPE,
      BIOMETRIA,
      JUNTA_APURADORA,
      LOCAL_VOTACAO,
      IS_CESC,
      IS_COLIG,
      IS_COLIG_INFO,
      IS_SUPLEMENTAR,
      IS_BR,
    } = transformed;

    const setup = this.setupLinePopulation(transformed);

    if (!setup) {
      return;
    }

    if (CARGO?.match(/vice/gim)) {
      return;
    }

    this.checkBallot({
      turno: TURNO,
      id: ID,
      upsert: {
        id: ID,
        uf: UF,
        turno: TURNO,
        zona: ZONA,
        secao: SECAO,
        municipio: MUNICIPIO,
        codigo: CODIGO_MUNICIPIO,
        scope: SCOPE,
        local: LOCAL_VOTACAO,
        status: URNA_TIPO,
        cargos: {},
      },
    });

    if (ABERTURA && ENCERRAMENTO) {
      this.setBallot({
        id: ID,
        path: `abertura`,
        value: ABERTURA,
      });
      this.setBallot({
        id: ID,
        path: `encerramento`,
        value: ENCERRAMENTO,
      });
    }

    if (JUNTA_APURADORA) {
      this.setBallot({
        id: ID,
        path: `junta_apuradora`,
        value: JUNTA_APURADORA,
      });
    }

    if (COUNT) {
      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: "absolutos.total",
        add: COUNT,
      });
    }

    if (BIOMETRIA) {
      this.setBallot({
        id: ID,
        path: `cargos.${CARGO}.biometria`,
        value: BIOMETRIA,
      });
    }

    if (COMPARECIMENTOS) {
      this.setBallot({
        id: ID,
        path: `cargos.${CARGO}.comparecimentos`,
        value: COMPARECIMENTOS,
      });
    }

    if (APTOS) {
      if (
        CARGO?.match(
          /^(prefeito|presidente|deputado|senador|vereador|governador)/gim
        )
      ) {
        this.setBallot({
          id: ID,
          path: `cargos.${CARGO}.aptos`,
          value: APTOS,
        });
      }

      if (this.accumulator.boxes[ID]?.absolutos?.aptos) {
        if (this.accumulator.boxes[ID].absolutos.aptos < APTOS) {
          this.setBallot({
            id: ID,
            path: `absolutos.aptos`,
            value: APTOS,
          });
        }
      } else {
        this.setBallot({
          id: ID,
          path: `absolutos.aptos`,
          value: APTOS,
        });
      }
    }

    if (URNA) {
      this.setBallot({ id: ID, path: "urna", value: URNA });
    }

    if (URNA_TIPO?.match(/n[ãa]{1}o_(instalada|apurada)/gim)) {
      log(`URNA TIPO ${URNA_TIPO}`);
      return;
    }

    if (!NUMERO || !COUNT || !CANDIDATO) {
      log(`ZEROED AT ${ID}`, { emoji: "🧨" });
      return;
    }

    if (
      !CARGO?.match(
        /^(prefeito|presidente|deputado|senador|vereador|governador)/gim
      )
    ) {
      return;
    }

    if (NUMERO === "99") {
      throw "#73426";
    }

    if (NUMERO === "98") {
      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `cargos.${CARGO}.`,
        data: [
          { path: "anulados", add: COUNT },
          { path: "total", add: COUNT },
        ],
        scoped: true,
      });

      return;
    }

    if (NUMERO === "97") {
      log("FOUND PENDENTE VOTE", { emoji: "🏭" });

      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `cargos.${CARGO}.`,
        data: [
          { path: "pendentes", add: COUNT },
          { path: "total", add: COUNT },
        ],
        scoped: true,
      });

      return;
    }

    if (VOTAVEL_TIPO === "2" || NUMERO === "95") {
      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `cargos.${CARGO}.`,
        data: [
          { path: "brancos", add: COUNT },
          { path: "total", add: COUNT },
        ],
        scoped: true,
      });

      return;
    }

    if (VOTAVEL_TIPO === "3" || NUMERO === "96") {
      if (VOTAVEL_TIPO !== "3") {
      }

      if (NUMERO !== "96") {
      }

      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `cargos.${CARGO}.`,
        data: [
          { path: "nulos", add: COUNT },
          { path: "splip", add: COUNT },
          { path: "total", add: COUNT },
        ],
        scoped: true,
      });

      return;
    }

    if (
      CARGO.match(/deputado|vereador/gim) &&
      (VOTAVEL_TIPO === "4" || NUMERO.length === 2)
    ) {
      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `cargos.${CARGO}.`,
        data: [
          { path: "total", add: COUNT },
          { path: "validos", add: COUNT },
          { path: "legenda", add: COUNT },
        ],
        scoped: true,
      });

      this.pushGeneral({
        id: ID,
        turno: TURNO,
        scope: SCOPE,
        path: `partidos.${CARGO}.${PARTIDO}.`,
        data: [
          { path: "validos", add: COUNT },
          { path: "legenda", add: COUNT },
        ],
        scoped: true,
      });

      this.pushGeneral({
        turno: TURNO,
        scope: SCOPE,
        path: `absolutos.`,
        data: [{ path: "validos", add: COUNT }],
      });

      return;
    }

    this.pushGeneral({
      id: ID,
      turno: TURNO,
      scope: SCOPE,
      path: `cargos.${CARGO}.`,
      data: [
        { path: "validos", add: COUNT },
        { path: "nominais", add: COUNT },
        { path: "total", add: COUNT },
      ],
      scoped: true,
    });

    this.pushGeneral({
      id: ID,
      turno: TURNO,
      scope: SCOPE,
      path: `partidos.${CARGO}.${PARTIDO}.`,
      data: [
        { path: "nominais", add: COUNT },
        { path: "validos", add: COUNT },
      ],
      scoped: true,
    });

    this.pushGeneral({
      turno: TURNO,
      scope: SCOPE,
      path: `absolutos.`,
      data: [{ path: "validos", add: COUNT }],
    });

    this.setResult({
      turno: TURNO,
      scope: SCOPE,
      path: `candidatos.${CARGO}.${CANDIDATO}.votos`,
      add: COUNT,
      scoped: true,
    });

    this.setBallot({
      id: ID,
      path: `validos`,
      push: {
        nome: CANDIDATO,
        votos: COUNT,
        partido: PARTIDO,
      },
    });
  }
}
