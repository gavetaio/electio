import { useEffect } from 'react';
import { useLayoutContext } from 'renderer/context/layout';
import { filteredExposedByBoxExposed } from './transformers';
import {
  Wrapper,
  Table,
  Block,
  Loader,
  LineChart,
  Section,
  Empty,
} from '@gavetaio/ui';
import { useNavigation } from 'renderer/features/navigation';

const ExposedPage = () => {
  const { getData, apiGet }: any = useLayoutContext();
  const { boxesExposed } = getData();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!boxesExposed?.length) {
      apiGet({ action: 'get/boxes/exposed' });
    }
  }, []);

  const renderData = () => {
    if (typeof boxesExposed === 'undefined') {
      return <Loader />;
    }

    if (!boxesExposed?.length) {
      return <Empty action={() => navigate('/')} />;
    }

    const transformed = filteredExposedByBoxExposed({
      boxes: boxesExposed,
      navigate,
      filters: { groups: ['uf'] },
    });

    return (
      <>
        <Section>
          <LineChart {...transformed.chart} title="Gráfico" />
        </Section>
        <Section>
          <Table {...transformed.table} />
        </Section>
      </>
    );
  };

  return (
    <Wrapper>
      <Section title="Sigilo quebrado de forma direta">
        <Block noMargin title="Detalhes">
          <p>
            Esta análise explora a quebra do <b>sigilo do voto</b> de forma
            direta em eleições recentes. São seções onde para um determinado
            cargo, todos eleitores tenham votado em um mesmo candidato; para a
            confirmação desta ocorrência ser completa, também checamos se a
            mesma seção possui <b>zero votos inválidos</b> (brancos ou nulos)
            para o mesmo cargo. Veja maiores detalhes no documento{' '}
            <a target="_blank" href="https://gaveta.io/g2v2">
              gaveta.io/G2V2
            </a>{' '}
            —{' '}
            <strong>
              Da quebra do sigilo do voto nas eleições brasileiras
            </strong>
          </p>
        </Block>
      </Section>
      {renderData()}
    </Wrapper>
  );
};

export default ExposedPage;
