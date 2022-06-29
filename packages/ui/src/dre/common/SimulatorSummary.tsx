/* eslint-disable react/jsx-props-no-spreading */
import { forEachList } from "@gavetaio/core";
import { Table } from "../../base";

const infoToSimulatorTable: any = ({ config, extra }) => {
  const header = ["Tipo", "Valor"];
  const data = [];

  const { candidatos, partidos, settings } = config;

  forEachList(extra, (key, value) => {
    data.push([key, value]);
  });

  data.push(["candidatos", candidatos?.length || 0]);
  data.push(["partidos", partidos?.length || 0]);
  data.push(["votos", settings?.length || 0]);

  const cargoList = [];
  settings.forEach(({ cargo }) => {
    if (cargoList.indexOf(cargo) === -1) {
      cargoList.push(cargo);
    }
  });

  data.push(["cargos", cargoList.join(", ")]);

  settings.forEach(() => {
    //
  });

  return {
    header,
    data,
  };
};

const SimulatorSummary: any = ({ config, extra }: any) => {
  const data: any = infoToSimulatorTable({
    config,
    extra,
  });

  return <Table title="Sumário" {...data} sortable={false} />;
};

export default SimulatorSummary;
