import { useEffect, useState } from "react";
import { RevisitedBox } from "./Revisited";
import { getTransformedResponse, getVoteStatus } from "./helpers";
import { getPartidoFromList, getTransformedNumero } from "../common/helpers";
import useCustomState from "../hooks/useCustomState";
import { forEachList } from "@gavetaio/core";
import SimulatorSummary from "../common/SimulatorSummary";
import SimulatorVotes from "../common/SimulatorVotes";
import SimulatorLogs from "../common/SimulatorLogs";
import { Selector, Loader, Section, Block, Button } from "@gavetaio/ui";
// @ts-ignore
import styles from "./Simulador.module.scss";

const INITIAL_STATE = {
  candidato: { nome: null },
  partido: { nome: null },
  votos: null,
  legenda: false,
  stage: 0,
  warning: 0,
  incomplete: false,
  restarted: false,
  current: {},
};

const SELECTOR = [
  { label: "Sumário", value: "sumario", selected: true },
  { label: "Voto", value: "voto", selected: true },
  { label: "Logs", value: "logs", selected: true },
];

const ESSENTIALS = [];

const Simulador = ({ config, extra = {}, simple = false }: any) => {
  const [numbers, setNumbers, resetNumbers, numbersRef] = useCustomState([]);
  const [data, setData, resetData, dataRef] = useCustomState(null);
  const [renderedExtras, setRenderedExtras]: any = useState({});
  const [state, setVoteState, resetVoteState, stateRef]: any =
    useCustomState(INITIAL_STATE);
  const [logs, pushLogs, resetLogs, logsRef]: any = useCustomState([]);
  const [voteGlobal, setVoteGlobal, resetVoteGlobal, voteGlobalRef]: any =
    useCustomState({});
  const [boxObject, setBoxObject]: any = useState(
    getTransformedResponse({ state, numbers })
  );

  const logAction = (label, value = null) => {
    const val = typeof value !== "object" ? { event: value } : value;
    const transformed = {
      numbers: numbers.join(""),
      cargo: state.current.cargo,
      ...val,
    };

    pushLogs({ label, value: transformed });
  };

  const clearState = () => {
    if (stateRef.current?.stage === 0) {
      logAction("clear-rejected", { stage: stateRef.current.stage });
      return;
    }
    logAction("clear-state");
    resetVoteState({ current: state.current });
    clearInputNumber();
  };

  const deleteOneNumber = () => {
    const { numbers } = getRefs();
    if (!numbers?.length) {
      clearState();
      return;
    }

    if (numbers.length === 1) {
      clearState();
      return;
    }

    setInputNumber({ remove: true });
  };

  const clearDeletion = (custom = null) => {
    const numberList = custom || numbers;

    const newState: any = {
      incomplete: false,
      restarted: false,
    };

    if (numberList.length < 2) {
      newState.partido = null;
    }

    if (numberList.length < state.current.digitos) {
      newState.candidato = null;
    }

    setVoteState(newState);
  };

  const getRefs = () => {
    return {
      data: dataRef.current,
      state: stateRef.current,
      numbers: numbersRef.current,
    };
  };

  const checkPartido = (numero) => {
    const { data, state } = getRefs();
    if (!data?.partidos) {
      logAction("check-partido", { event: "not-configured" });
      return;
    }

    if (state?.partido?.nome) {
      logAction("check-partido", { event: "already-found" });
      return;
    }

    const num = `${numero}`.slice(0, 2);
    const result = getPartidoFromList({ numero: num, list: data?.partidos });

    if (!result) {
      logAction("check-partido", { event: "wrong-number" });
      return;
    }

    logAction("check-partido", {
      event: "updated",
      value: result.nome,
    });

    setVoteState({
      partido: result,
    });
  };

  const checkCandidato = (numero) => {
    const { data, state } = getRefs();
    if (!data?.candidatos || state.warning) {
      logAction("check-candidato", { event: "not-configured" });
      return;
    }

    const candidato = data.candidatos.find(
      (cand) => cand.cargo === state.current.cargo && cand.numero === numero
    );

    if (!candidato) {
      logAction("check-candidato", { event: "wrong-number" });
      return;
    }

    const _data: any = [];
    forEachList(candidato, (key, value) => {
      _data.push({ value: `${key}: ${value}` });
    });

    logAction("check-candidato", {
      event: "updated",
      value: _data,
    });

    setVoteState({
      candidato,
    });
  };

  const goToNextCandidate = (index = null) => {
    const { data } = getRefs();
    if (!data) {
      logAction("next-candidate", { event: "reject" });
      return false;
    }

    let next = null;
    if (index !== null) {
      next = data.settings[index];
    } else {
      next = data.settings.find((item) => !voteGlobalRef.current[item.id]);
    }

    if (next) {
      logAction("next-candidate", {
        event: "goto",
        value: JSON.stringify(next),
      });

      resetVoteState({ current: next });
      clearInputNumber();
      return true;
    }

    logAction("next-candidate", { event: "null" });
    return false;
  };

  const updateState = (custom = null) => {
    const { numbers, state } = getRefs();
    const numberList = custom || numbers;
    logAction("updated-state", { event: "run" });
    clearDeletion(numberList);

    if (numberList.length === 1) {
      if (state?.stage !== 1) {
        logAction("updated-state", { event: "start-vote" });
        setVoteState({ stage: 1 });
        return;
      }
      logAction("updated-state", { event: "return-on-length" });
      return;
    }

    if (numberList.length > 1) {
      logAction("updated-state", { event: "check-partido" });
      checkPartido(numberList.join(""));
    }

    if (numberList.length === state.current.digitos) {
      logAction("updated-state", { event: "check-candidato" });
      checkCandidato(numberList.join(""));
    }
  };

  const checkForExtraVote = (number) => {
    const { state } = getRefs();
    const { id, cargo } = state.current;

    if (!id || !cargo) {
      return false;
    }

    const cargoReg = new RegExp(`^${cargo}_`, "mig");
    let presence = false;

    if (id.match(/[1-2]{1}$/gim)) {
      forEachList(voteGlobalRef.current, (candId, { gravado }) => {
        if (candId.match(cargoReg)) {
          if (gravado === number) {
            presence = true;
          }
        }
      });
    }
    return presence;
  };

  const isNextNumberUnavailable = (number) => {
    const { state, numbers, data } = getRefs();

    const toCheck = state.warning
      ? `${numbers.slice(0, numbers.length - 1).join("")}${number || ""}`
      : `${numbers.join("")}${number || ""}`;

    const hasExtraVote = checkForExtraVote(toCheck);

    if (hasExtraVote) {
      return 2;
    }

    const reg = new RegExp(`^${toCheck}`, "mig");

    const presence = data.candidatos.find(({ numero, cargo }) => {
      if (cargo === state.current.cargo && numero.match(reg)) {
        return true;
      }
      return false;
    });

    if (!presence) {
      return 1;
    }

    return 0;
  };

  const clearInputNumber = () => {
    setVoteState({});
    setInputNumbers([]);
    return;
  };

  const setInputNumbers = (numbers = []) => {
    setNumbers(numbers);
    updateState(numbers);
  };

  const setInputNumber = ({ number, warning = 0, remove = false }: any) => {
    const { numbers, state } = getRefs();

    if (state.warning && warning) {
      const currentNumbers = numbers.slice(0, numbers.length - 1);
      setInputNumbers([...currentNumbers, number]);
      return;
    }

    setVoteState({ warning });

    if (remove) {
      const newNumbers = numbers.slice(0, numbers.length - 1);
      setInputNumbers(newNumbers);
      return;
    }

    setInputNumbers([...numbers, number]);
  };

  const onKeyPress = (number) => {
    const { state, numbers } = getRefs();

    if (numbers?.length >= state.current.digitos && !state.warning) {
      logAction("key-press", {
        event: "rejected",
        value: `extra digit - ${number}`,
      });

      if (state?.candidato?.nome) {
        return "confirm";
      }

      return false;
    }

    if (state.boolean) {
      if (number !== "1" && number !== "3") {
        logAction("key-press", {
          event: "rejected",
          value: `boolean-question`,
        });
        return false;
      }
    }

    if (state?.branco || state?.nulo || state?.legenda) {
      logAction("key-press", {
        event: "rejected",
        value: `blank - ${number}`,
      });
      return false;
    }

    if (state.warning) {
      logAction("key-press", {
        event: "rejected",
        value: `not available - ${number}`,
      });
      return false;
    }

    const isUnavailable = isNextNumberUnavailable(number);

    if (isUnavailable !== 0) {
      setInputNumber({ number, warning: isUnavailable });

      logAction("key-press", {
        event: "rejected",
        value: `not available - ${number}`,
      });
      return false;
    }

    logAction("key-press", { event: "number-pushed", value: number });
    setInputNumber({ number });
    return true;
  };

  const restartFullVote = (restarted = true) => {
    resetVoteGlobal({}, null, true);
    resetVoteState();
    setInputNumbers([]);
    goToNextCandidate(0);
    setVoteState({ restarted });
  };

  useEffect(() => {}, [state]);

  const resetCurrentVote = () => {
    setVoteState({ nulo: false, branco: false, stage: 1 });
  };

  const clearLegendaScreen = () => {
    setVoteState({ legenda: false });
  };

  const globalVoteToReview = () => {
    const votos = [];

    data.settings.forEach((setting) => {
      const { cargo, digitos, id, label, legenda } = setting;

      let info: any = {};
      if (voteGlobalRef.current[id]) {
        const { gravado } = voteGlobalRef.current[id];
        info.cargo = cargo;
        info.display = label;
        info.type = null;

        if (gravado === "96") {
          info.nome = "VOTO NULO";
          info.type = "nulo";
        } else if (gravado === "95") {
          info.nome = "VOTO EM BRANCO";
          info.type = "branco";
        } else if (legenda && gravado.length < digitos) {
          info.nome = "VOTO NA LEGENDA";
          info.partido = gravado;
          info.numero = gravado;
          info.type = "legenda";
        }

        if (!info.nome) {
          const candidato = data.candidatos.find(
            (cand) => cand.cargo === cargo && cand.numero === gravado
          );

          if (candidato) {
            info.type = "candidato";
            info = { ...info, ...candidato };
          }
        }
      }

      votos.push(info);
    });

    return votos;
  };

  const onFixPress = () => {
    logAction("on-fix-press", { event: "start" });

    if (state?.stage < 0) {
      resetCurrentVote();
      return;
    }

    if (state?.stage === 2) {
      return false;
    }

    if (state?.stage !== 1) {
      logAction("on-fix-press", {
        event: "stage-return",
        value: state.stage || "null",
      });
      return;
    }

    if (state?.legenda) {
      clearLegendaScreen();
      return;
    }

    logAction("on-fix-press", { event: "clear-state" });

    deleteOneNumber();
  };

  const onFixLongPress = () => {
    restartFullVote();
  };

  const onBlankLongPress = () => {};

  const voteReview = () => {
    const votos = globalVoteToReview();

    setVoteState({
      stage: 2,
      votos,
    });
  };

  const endVote = () => {
    setVoteState({
      stage: 3,
    });
  };

  const onConfirmLongPress = () => {
    const status = getVoteStatus({
      state,
      numbers,
    });

    if (
      status?.isCompleto ||
      status.isBranco ||
      status?.isLegenda ||
      status?.isNulo
    ) {
      return;
    }

    if (state?.stage === 0 || numbers.length === 0) {
      resetVoteState({ branco: true, stage: -1, current: state.current });
      return true;
    }

    if (state?.stage !== 1 || state?.nulo || state?.legenda) {
      return false;
    }

    logAction("null-choice", { event: "long-press", value: numbers.join(" ") });
    resetVoteState({ nulo: true, stage: -1, current: state.current });

    return true;
  };

  const recordChoice = (status) => {
    const numbers = numbersRef.current;
    const state = stateRef.current;
    const numero = getTransformedNumero(status, numbers);

    setVoteGlobal({
      [`${state.current.id}`]: {
        gravado: `${numero}`,
        digitado: `${numbers.join("")}`,
      },
    });

    const next = goToNextCandidate();

    if (!next) {
      if (state.stage === 2) {
        logAction("on-confirm-press", "end-vote");
        endVote();
        return true;
      }

      logAction("on-confirm-press", "review-vote");
      voteReview();
      return true;
    }

    logAction("on-confirm-press", "clear-state");
    clearState();
    return true;
  };

  const onConfirmPress = () => {
    logAction("on-confirm-press", "action");
    const numbers = numbersRef.current;
    const state = stateRef.current;

    const status = getVoteStatus({
      state,
      numbers,
    });

    const isInvalid = status?.isBranco || status?.isNulo;

    if (isInvalid) {
      return recordChoice(status);
    }

    if (status.hasLegenda && status.hasPartido && status.isLegenda) {
      return recordChoice(status);
    }

    if (!state?.current?.cargo) {
      logAction("on-confirm-press", "reject-cargo");
      return false;
    }

    if (state.boolean) {
      logAction("on-confirm-press", "reject-boolean");
      return false;
    }

    if (
      status.hasLegenda &&
      status.hasPartido &&
      numbers?.length === 2 &&
      !status.isLegenda
    ) {
      logAction("on-confirm-press", "legenda");
      setVoteState({ legenda: true });
      return true;
    }

    if (
      !status.isCompleto &&
      (!status.hasLegenda || (status.hasLegenda && !status.isLegenda))
    ) {
      logAction("on-confirm-press", "reject-numbers-length");
      setVoteState({
        incomplete: true,
      });

      if (state?.warning) {
        return "danger";
      }

      return "pad";
    }

    return recordChoice(status);
  };

  const onBlankPress = () => {
    logAction("blank-press", "action");

    if (state.branco) {
      logAction("blank-press", { event: "reject", value: "already-nulled" });
      return;
    }

    if (numbers?.length) {
      logAction("blank-press", {
        event: "reject",
        value: `${numbers.length} numbers`,
      });
      return;
    }

    logAction("blank-press", { event: "reset", value: numbers.join(" ") });
    resetVoteState({ branco: true, stage: -1, current: state.current });
    clearInputNumber();
  };

  const handleSelectorChange = (items) => {
    const rendered = {};
    items.forEach(({ value, selected }) => (rendered[value] = selected));
    setRenderedExtras(rendered);
  };

  useEffect(() => {
    if (!config?.settings) {
      return;
    }

    setData(config);
    goToNextCandidate();
  }, [config]);

  useEffect(() => {
    const boxPropsObject = getTransformedResponse({ state, numbers });
    setBoxObject(boxPropsObject);
  }, [state, numbers, data]);

  if (!data || !data.candidatos || !state?.current?.cargo) {
    return <Loader />;
  }

  const revisited = (
    <RevisitedBox
      onKeyPress={onKeyPress}
      onFixPress={onFixPress}
      onFixLongPress={onFixLongPress}
      onBlankPress={onBlankPress}
      onBlankLongPress={onBlankLongPress}
      onConfirmPress={onConfirmPress}
      onConfirmLongPress={onConfirmLongPress}
      partido={state?.partido}
      candidato={state?.candidato}
      votos={state?.votos}
      restarted={state?.restarted}
      incomplete={state?.incomplete}
      finished={state?.stage === 3}
      review={state?.stage === 2}
      {...boxObject}
      warning={state?.warning}
    />
  );

  if (simple) {
    return (
      <div className={styles.container}>
        <section>{revisited}</section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Section>
        <Block
          title="Informações"
          description="Selecione as caixas de informação adicional"
        >
          <Selector items={SELECTOR} onChange={handleSelectorChange} />
        </Block>
      </Section>
      {renderedExtras?.sumario && (
        <Section>
          <SimulatorSummary config={config} extra={extra} />
        </Section>
      )}
      <Section>
        <Block title="Simulador Corrigido">
          {revisited}
          <div className={styles.restartButton}>
            <hr />
            <Button
              onClick={() => {
                pushLogs([]);
                restartFullVote(false);
              }}
            >
              Reiniciar Simulação
            </Button>
          </div>
        </Block>
      </Section>
      {renderedExtras?.voto && (
        <Section>
          <SimulatorVotes config={config} votes={voteGlobal} />
        </Section>
      )}
      {renderedExtras?.logs && (
        <Section>
          <SimulatorLogs events={ESSENTIALS} logs={logs} />
        </Section>
      )}
    </div>
  );
};

export default Simulador;
