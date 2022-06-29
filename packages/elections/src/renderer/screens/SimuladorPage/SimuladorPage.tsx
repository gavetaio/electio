import { useEffect, useState } from 'react';
import { useLayoutContext } from 'renderer/context/layout';
import { useParams } from 'react-router-dom';
import {
  Wrapper,
  RevisitedBox,
  LegacyBox,
  Section,
  Selector,
  Empty,
  Block,
} from '@gavetaio/ui';
import common from 'renderer/texts/common';
import { transformEleicao } from './transformers';
import { useNavigation } from 'renderer/features/navigation';

const SimuladorPage = () => {
  const { apiGet, getData }: any = useLayoutContext();
  const { elections, electionList } = getData();
  const [ufs, setUfs] = useState(null);
  const [years, setYears] = useState(null);
  const [data, setData] = useState(null);
  const [extra, setExtra] = useState({});
  const [eid, setEid] = useState(null);
  const { type } = useParams();
  const { navigate } = useNavigation();
  const cid = null; // cidade_id ;-)
  const electionData = elections[eid] || null;

  useEffect(() => {
    apiGet({ action: `get/elections` });
  }, []);

  useEffect(() => {
    if (!ufs?.length || !years?.length) {
      return;
    }

    const uf = ufs.find((uf) => uf.selected);
    const year = years.find((year) => year.selected);

    if (!uf || !year) {
      return;
    }

    const eid = `${uf.value.toUpperCase()}-${year.value}-1`;

    setEid(eid);
  }, [ufs, years]);

  useEffect(() => {
    if (!elections?.[`${eid}`]) {
      apiGet({ action: `get/election/${eid}` });
    }
  }, [eid]);

  useEffect(() => {
    if (!electionData) {
      return;
    }

    const { eleicao, cidades, candidatos } = electionData;
    const root = cid ? cidades[cid] : eleicao;
    const candidatosObject = root.candidatos || candidatos;
    const payload: any = {
      candidatos: candidatosObject,
      multipliers: eleicao.multipliers,
    };

    setData(transformEleicao(payload));
    setExtra({
      id: eleicao.resumo.id,
    });
  }, [electionData]);

  useEffect(() => {
    if (!(electionList?.tags && !ufs?.length && !years?.length)) {
      return;
    }
    setUfs(
      electionList.tags.ufs.map((item, index) => {
        return {
          value: item.value,
          label: item.value,
          selected: index === 0,
        };
      })
    );
    setYears(
      electionList.tags.years
        .filter((item) => item.federal)
        .map((item, index) => {
          return {
            value: item.value,
            label: item.value,
            selected: index === 0,
          };
        })
    );
  }, [electionList]);

  const renderSelectors = () => {
    if (!years?.length && !ufs?.length) {
      return null;
    }

    return (
      <Section>
        <Block
          title="Selecione a Eleição"
          description="Selecione o ciclo eleitoral para o carregamento da urna"
        >
          <Selector radio items={years} onChange={setYears} />
          <Selector radio items={ufs} onChange={setUfs} />
        </Block>
      </Section>
    );
  };

  const renderSimulador = () => {
    if (!data) {
      return null;
    }
    if (type === 'legado') {
      return <LegacyBox config={data} extra={extra} />;
    }
    if (type === 'refatorado') {
      return <RevisitedBox config={data} extra={extra} />;
    }
    return null;
  };

  const renderDescription = () => {
    if (type === 'legado') {
      return common.simulador.legado();
    }

    return common.simulador.refatorado();
  };

  const handleNavigate = () => {
    navigate('/');
  };

  return (
    <Wrapper>
      <Section title="Simulador Eleitoral">{renderDescription()}</Section>
      {renderSelectors()}
      {data && renderSimulador()}
      {!data && (
        <Empty
          action={handleNavigate}
          message="Para visualizar esta página, carregue os dados de pelo menos um ciclo eleitoral."
        />
      )}
    </Wrapper>
  );
};

export default SimuladorPage;
