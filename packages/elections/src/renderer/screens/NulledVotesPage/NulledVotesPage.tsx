import { useEffect } from 'react';
import { useLayoutContext } from 'renderer/context/layout';
import {
  Wrapper,
  Table,
  Block,
  Loader,
  Section,
  LineChart,
  Empty,
} from '@gavetaio/ui';
import { filteredNulledSummary } from './transformers';
import { useNavigation } from 'renderer/features/navigation';

const NullVotesPage = () => {
  const { apiGet, getData }: any = useLayoutContext();
  const { votesExcluded } = getData();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!votesExcluded?.length) {
      apiGet({ action: 'get/votes/excluded' });
    }
  }, []);

  const renderSummary = () => {
    if (typeof votesExcluded === 'undefined') {
      return <Loader />;
    }

    if (!votesExcluded?.length) {
      return <Empty action={() => navigate('/')} />;
    }

    const transformed = filteredNulledSummary(votesExcluded);

    return (
      <>
        <Section>
          <LineChart {...transformed.chart} />
        </Section>
        <Section>
          <Table showData {...transformed.table} />
        </Section>
      </>
    );
  };

  return (
    <Wrapper>
      <Section title="Votos válidos excluídos">
        <Block noMargin title="Detalhes">
          <p>
            Analisamos aqui os votos anulados por{' '}
            <b>indeferimento de candidatura</b>. São candidatos que tiveram seu
            nome adicionado na urna eletrônica, mesmo com o <b>indeferimento</b>{' '}
            de sua candidatura, por terem apresentado recurso e estarem
            aguardando decisão de instância superior. Esta ocorrência tornou-se
            comum a partir de 2004 com a publicação da resolução{' '}
            <b>21.608/2004</b>, e, posteriormente, pela lei <b>12.034/2009</b>.
            Entenda os detalhes no documento:{' '}
            <a target="_blank" href="https://gaveta.io/G2V5">
              gaveta.io/g2v5
            </a>{' '}
            —{' '}
            <strong>
              Da desproporcionalidade do direito político brasileiro
            </strong>
          </p>
          <p>
            Para localizar esta ocorrência nos dados eleitorais, precisamos
            separar os candidatos que estavam com o status{' '}
            <b>indeferido com recurso</b> (<b>consulta_cand.zip</b>) no momento
            da inserção na urna eletrônica, e, posteriormente, não tiveram seus
            votos computados <mark>situação 2, 3 ou 4</mark>. Somados a estes,
            também os votos direcionado para a legenda de <b>partidos</b> que
            tiveram sua inscrição indeferida.
          </p>
        </Block>
      </Section>
      {!votesExcluded ? <Loader /> : renderSummary()}
    </Wrapper>
  );
};

export default NullVotesPage;
