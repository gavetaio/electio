/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/button-has-type */
import { TrashIcon } from "@primer/octicons-react";
import { forEachList } from "@gavetaio/core";
import { Table } from "../../base";

const logsToTable = ({ logs, events }) => {
  const result = {
    header: ["Índice", "Tipo", "Evento", "Valor", "Extra"],
    data: [],
  };

  if (!logs?.length) {
    return result;
  }

  logs.forEach((log, index) => {
    if (events?.length) {
      if (events.indexOf(log.value?.event) === -1) {
        return;
      }
    }
    const main = {
      event: "",
      value: "",
      extra: [],
    };
    forEachList(log.value, (key, value) => {
      if (key === "event" || key === "value") {
        main[key] = value;
        return;
      }
      main.extra.push({ key, value });
    });

    let type = null;

    const row = [];
    row.push(index);
    row.push(log.label);
    row.push(main.event || "");
    row.push(main.value || "");
    row.push(main.extra);
    result.data.push({ type, data: row });
  });

  result.data.reverse();

  return result;
};

const SimulatorLogs = (props: any) => {
  const { logs = [], events = [], onClearLogs = null } = props;

  const actions = [
    {
      icon: <TrashIcon />,
      action: () => {
        if (typeof onClearLogs === "function") {
          onClearLogs();
        }
      },
    },
  ];

  return (
    <Table
      titleActions={actions}
      title="Controle de logs"
      {...logsToTable({ logs, events })}
      sortable={false}
    />
  );
};

export default SimulatorLogs;
