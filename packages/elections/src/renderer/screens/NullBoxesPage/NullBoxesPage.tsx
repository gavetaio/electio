import { useEffect } from 'react';
import {
  Wrapper,
  Table,
  Block,
  Loader,
  LineChart,
  Section,
  Empty,
} from '@gavetaio/ui';
import { useLayoutContext } from 'renderer/context/layout';
import { filteredNullBoxes } from './transformers';
import { useNavigation } from 'renderer/features/navigation';

const NullBoxesPage = () => {
  const { getData, apiGet }: any = useLayoutContext();
  const { boxesNulled } = getData();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!boxesNulled?.length) {
      apiGet({ action: 'get/boxes/nulled' });
    }
  }, []);

  const renderData = () => {
    if (typeof boxesNulled === 'undefined') {
      return <Loader />;
    }

    if (!boxesNulled?.length) {
      return <Empty action={() => navigate('/')} />;
    }

    const transformed = filteredNullBoxes({
      boxes: boxesNulled,
      filters: {},
    });

    return (
      <>
        {transformed?.chart && (
          <Section>
            <LineChart {...transformed.chart} />
          </Section>
        )}
        {transformed?.table && (
          <Section>
            <Table title="Dados" {...transformed.table} />
          </Section>
        )}
      </>
    );
  };

  return (
    <Wrapper>
      <Section title="Votação anulada ou perdida">
        <Block noMargin title="Detalhes">
          <p>
            Esta análise explora os <strong>votos anulados</strong> em{' '}
            <strong>seções eleitorais inteiras</strong>. Não existe registro de
            apuração paralela destas seções, tão pouco um motivo oficial para
            sua nulidade disponível em informações oficiais do repositório
            eleitoral. Veja mais detalhes no documento{' '}
            <a target="_blank" href="https://gaveta.io/g2v3">
              gaveta.io/g2v3
            </a>{' '}
            —{' '}
            <strong>
              Da anulação de votos em massa na urna eletrônica brasileira
            </strong>
          </p>
          <h6>Da ocorrência em IRUPI/ES</h6>
          <p>
            A ocorrência de <b>IRUPI</b>, em <b>2020</b>, é a confirmação mais
            recente de perda de votos por falha eletrônica; isto ocorre por ter
            sido julgada oficialmente no <b>RE 060056186</b>. Fato similar,
            tornou-se público em <b>2014</b> na cidade de <b>Içara/SC</b>. A
            urna de <b>IRUPI</b>, não consta na tabulação de resultados, como
            todas as demais, para encontrá-la, precisamos fazer a correlação com
            o arquivo de <b>correspondências esperadas</b>. Para as urnas
            encontradas desta forma, escolhemos o label <b>perdidas</b>.
          </p>
          <hr />
          <h6>Da explosão de erros em 1998 e 2002</h6>
          <p>
            Pela discrepância dos dados, pode-se inicialmente cogitar a
            existência de uma falha de transformação; porém, checando os
            resultados oficiais, é possível confirmar que estas urnas estão
            realmente perdidas/anuladas. São mais de 100 mil votos anulados em
            dois ciclos eleitorais, ocorrência ímpar em todo histórico
            eleitoral, sem explicação em relatórios oficiais.
          </p>
          <p>
            O único documento encontrado, relevante a este caso, é a resolução{' '}
            <b>21.076/2002</b>, onde é oficialmente citada a extensa perda de
            votos por falha eletrônica nos pleitos de <b>2000</b>; também esta,
            ausente dos relatórios públicos oficiais. Curiosamente, no{' '}
            <a
              target="_blank"
              href="https://www.tse.jus.br/hotsites/catalogo-publicacoes/pdf/relatorio_eleicoes/relatorio.pdf"
            >
              relatório oficial das eleições de 2002
            </a>{' '}
            inexiste a citação da ocorrência de anulação de qualquer urna, seja
            por falha eletrônica ou qualquer outra causa.
          </p>
          <hr />
          <h6>Status nao_instalada e nao_apurada</h6>
          <p>
            Foram apenas <b>7 urnas</b> encontradas com este status; optamos por
            adicioná-las aqui, pela ausência de explicação oficial. Esta, somada
            ao fato da única explicação encontrada, definir urnas{' '}
            <b>nao_apuradas</b> como urnas que, por exemplo, possam ter{' '}
            <i>caído em um rio</i> (
            <a
              target="_blank"
              href="https://www.tre-mt.jus.br/eleicoes/eleicoes-plebiscitos-e-referendos/eleicos-anteriores/eleicoes-2016/parceria-divulgacao-de-resultados"
            >
              link/faq
            </a>
            ). Todas precisam de maiores explicações.
          </p>
          <p>
            <i>
              "Urnas não instaladas são aquelas nas quais não foi possível votar
              devido ao local de votação estar inacessível. Urnas não apuradas
              são aquelas em que houve votação, mas por algum motivo não foi
              possível recuperar os votos. Por exemplo:{' '}
              <b>
                <u>no caso de uma urna cair em um rio</u>
              </b>
              . Nos dois casos não é possível conhecer o comparecimento nem a
              abstenção."
            </i>
          </p>
          <hr />
          <h6>Status apurada</h6>
          <p>
            Apenas em <b>2014</b> começa a ser disponibilizado oficialmente o
            status da urna, antes desta data, precisamos checar a nulidade
            completa dos votos depositados para que seja possível localizá-las.
          </p>
        </Block>
      </Section>
      {renderData()}
    </Wrapper>
  );
};

export default NullBoxesPage;
