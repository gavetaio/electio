import { useEffect, useState } from "react";
import { LegacyBox } from "./Legacy";
import { getTransformedResponse, getVoteStatus } from "./helpers";
import { getPartidoFromList, getTransformedNumero } from "../common/helpers";
import useCustomState from "../hooks/useCustomState";
import { forEachList } from "@gavetaio/core";
import SimulatorSummary from "../common/SimulatorSummary";
import SimulatorVotes from "../common/SimulatorVotes";
import SimulatorLogs from "../common/SimulatorLogs";
import { Selector, Section, Block, Button } from "@gavetaio/ui";
// @ts-ignore
import styles from "./Simulador.module.scss";

const INITIAL_STATE = {
  state: {
    candidato: { nome: null },
    partido: { nome: null },
    stage: 0,
  },
  current: {
    order: 0,
  },
};

const SELECTOR = [
  { label: "Sumário", value: "sumario", selected: true },
  { label: "Voto", value: "voto", selected: true },
  { label: "Logs", value: "logs", selected: true },
];

const ESSENTIALS = [];

const Simulador = ({ config, extra = {} }: any) => {
  const [numbers, setNumbers, resetNumbers, numbersRef] = useCustomState([]);
  const [data, setData, resetData, dataRef] = useCustomState(null);
  const [renderedExtras, setRenderedExtras]: any = useState({});
  const [state, setVoteState, resetVoteState, stateRef]: any = useCustomState(
    INITIAL_STATE.state
  );
  const [current, setCurrent, resetCurrent, currentRef]: any = useCustomState(
    INITIAL_STATE.current
  );
  const [logs, setLogs, resetLogs, logsRef]: any = useCustomState([]);
  const [voteGlobal, setVoteGlobal, resetVoteGlobal, voteGlobalRef]: any =
    useCustomState({});
  const [boxObject, setBoxObject, resetBoxObject, boxObjectRef]: any =
    useCustomState(getTransformedResponse({ state, current, numbers }));

  const logAction = (label, value = null) => {
    const val = typeof value !== "object" ? { event: value } : value;
    const transformed = {
      numbers: numbers.join(""),
      cargo: current.cargo,
      ...val,
    };

    setLogs({ label, value: transformed });
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

  const clearState = () => {
    if (stateRef?.current?.stage === 0) {
      logAction("clear-rejected", { stage: stateRef.current.stage });
      return;
    }

    logAction("clear-state");
    resetVoteState();
    clearInputNumber();
  };

  const checkPartido = (numero) => {
    if (!data?.partidos) {
      logAction("check-partido", { event: "not-configured" });
      return;
    }

    if (stateRef.current?.partido?.nome) {
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
    const { data } = getRefs();
    if (!data?.candidatos) {
      logAction("check-candidato", { event: "not-configured" });
      return;
    }

    const candidato = data.candidatos.find((cand) => cand.numero === numero);

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

  const getRefs = () => {
    return {
      data: dataRef.current,
      current: currentRef.current,
      numbers: numbersRef.current,
      state: stateRef.current,
      logs: logsRef.current,
      voteGlobal: voteGlobalRef.current,
      boxObject: boxObjectRef.current,
    };
  };

  const goNext = () => {
    const { data, voteGlobal } = getRefs();
    if (!data?.settings) {
      return false;
    }

    const next = data.settings.find((item) => !voteGlobal[item.id]);

    if (next) {
      setCurrent(next);
      return true;
    }

    return false;
  };

  const updateState = (custom = null) => {
    const { numbers, state, current } = getRefs();
    const numberList = custom || numbers;

    logAction("updated-state");
    if (numberList.length === 1) {
      if (state?.stage !== 1) {
        logAction("updated-state", { event: "start-vote" });
        setVoteState({ stage: 1 });
        return;
      }
      logAction("updated-state", { event: "return-on-length-one" });
      return;
    }

    if (numberList.length > 1) {
      logAction("updated-state", { event: "check-partido" });
      checkPartido(numberList.join(""));
    }

    if (numberList.length === current.digitos) {
      logAction("updated-state", { event: "check-candidato" });
      checkCandidato(numberList.join(""));
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    goNext();
  }, [data]);

  useEffect(() => {
    if (!config?.settings) {
      return;
    }

    setData(config);
  }, [config]);

  const onKeyPress = (number) => {
    const { state, numbers, current } = getRefs();
    logAction("key-press");
    if (state?.blank) {
      logAction("key-press", {
        event: "rejected",
        value: `blank - ${number}`,
      });
      return;
    }
    if (numbers?.length >= current.digitos) {
      logAction("key-press", {
        event: "rejected",
        value: `extra digit - ${number}`,
      });
      return;
    }
    logAction("key-press", { event: "number-pushed", value: number });

    setInputNumbers([...numbers, number]);
    updateState();
  };

  const onFixPress = () => {
    const { state } = getRefs();
    logAction("fix-press");
    if (state?.stage !== 1) {
      logAction("fix-press", {
        event: "stage-return",
        value: state.stage || "null",
      });
      return;
    }
    logAction("fix-press", { event: "clear-state" });
    clearState();
  };

  const endVote = () => {
    setVoteState({
      stage: 2,
    });
  };

  const onConfirmPress = () => {
    const { current, state, numbers } = getRefs();
    logAction("confirm-press", "action");
    if (!current?.cargo) {
      logAction("confirm-press", "reject-cargo");
      return;
    }

    const status = getVoteStatus({
      state,
      current,
      numbers,
    });

    if (
      !status.isCompleto &&
      (!status.hasLegenda || (status.hasLegenda && !status.threshold))
    ) {
      logAction("confirm-press", "reject-numbers-length");
      return;
    }

    const numero = getTransformedNumero(status, numbers);

    setVoteGlobal({
      [`${current.id}`]: {
        gravado: `${numero}`,
        digitado: `${numbers.join("")}`,
      },
    });

    const next = goNext();
    if (!next) {
      logAction("confirm-press", "end-vote");
      endVote();
      return;
    }

    logAction("confirm-press", "clear-state");
    clearState();
  };

  const onNullPress = () => {
    const { state, numbers } = getRefs();
    logAction("null-press", "action");

    if (state.blank) {
      logAction("null-press", { event: "reject", value: "already-blank" });
      return;
    }

    if (numbers?.length) {
      logAction("null-press", {
        event: "reject",
        value: `${numbers.length} numbers`,
      });
      return;
    }

    logAction("null-press", { event: "reset", value: numbers.join(" ") });
    resetVoteState({ blank: true, stage: 1 });
    clearInputNumber();
  };

  useEffect(() => {
    const { state, current, numbers } = getRefs();
    const boxPropsObject = getTransformedResponse({ state, current, numbers });
    setBoxObject(boxPropsObject);
  }, [state, current, numbers]);

  const handleSelectorChange = (items) => {
    const rendered = {};
    items.forEach(({ value, selected }) => (rendered[value] = selected));
    setRenderedExtras(rendered);
  };

  const resetVote = () => {
    clearState();
    clearInputNumber();
    resetCurrent();
    setLogs([]);
    resetVoteState();
    resetVoteGlobal();
    goNext();
  };

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
        <Block title="Emulador legado">
          <LegacyBox
            onKeyPress={onKeyPress}
            onFixPress={onFixPress}
            onBlankPress={onNullPress}
            onConfirmPress={onConfirmPress}
            partido={state?.partido}
            candidato={state?.candidato}
            finished={state?.stage === 2}
            {...boxObject}
          />
          <div className={styles.restartButton}>
            <hr />
            <Button onClick={resetVote}>Reiniciar Simulação</Button>
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
          <SimulatorLogs
            events={ESSENTIALS}
            logs={logs}
            onClearLogs={resetLogs}
          />
        </Section>
      )}
    </div>
  );
};

export default Simulador;
