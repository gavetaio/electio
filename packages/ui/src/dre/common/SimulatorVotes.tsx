/* eslint-disable react/jsx-props-no-spreading */
import { forEachList } from "@gavetaio/core";
import { Table } from "../../base";

const getState = (number) => {
  if (number === "96") {
    return "nulo";
  }
  if (number === "95") {
    return "branco";
  }
  return "válido";
};

const getCargoDisplay = (id, settings) => {
  const item = settings.find((setting) => setting.id === id);
  return item?.label || null;
};

const votesToTable: any = ({ votes, settings }) => {
  const header = ["Cargo", "Número Digitado", "Número Gravado", "Status"];
  const data = [];

  forEachList(votes, (key, { digitado, gravado }) => {
    data.push([
      getCargoDisplay(key, settings),
      digitado,
      gravado,
      getState(gravado),
    ]);
  });

  return {
    header,
    data,
  };
};

const SimulatorVotes: any = ({ votes, config }: any) => {
  const { settings } = config;

  const data: any = votesToTable({ votes, settings });

  return <Table title="Resumo dos Votos" {...data} sortable={false} />;
};

export default SimulatorVotes;
