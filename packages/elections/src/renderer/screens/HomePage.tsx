import { useContext, useEffect, useState } from 'react';
import { LayoutContext } from 'renderer/context/layout';
import Dropper from 'renderer/components/Dropper';
import { Wrapper, Table, Loader, Block, Section } from '@gavetaio/ui';
import { transformFileList } from './helpers';

const Home = () => {
  const { getLayout, refreshData, setLoader }: any = useContext(LayoutContext);
  const { jsons, loader, folder } = getLayout();
  const [data, setData]: any = useState({});

  const handleListRefresh = () => {
    refreshData({
      types: ['jsons'],
    });
  };

  useEffect(() => {
    setData(transformFileList({ jsons }));
  }, [jsons]);

  useEffect(handleListRefresh, []);

  const renderTable = () => {
    if (!data?.files) {
      return <Loader />;
    }

    return (
      <Table
        firstRow={30}
        title="Arquivos transformados"
        header={['Arquivo', 'Tamanho', 'Atualizado']}
        data={data.files}
        sortDefault={-2}
        footer={[
          { type: 'count', suffix: 'ARQUIVOS' },
          { type: 'sum', suffix: 'MB' },
          '',
        ]}
      />
    );
  };

  return (
    <Wrapper>
      <Section title="Dados carregados">
        <Block
          noMargin
          title="Detalhes"
          description="Das instruções para a transformação dos dados do Repositório Eleitoral"
        >
          <p>
            Para carregar os dados de um ciclo eleitoral, acesse o site oficial
            do <strong>Repositório Eleitoral</strong> em{' '}
            <strong>
              <a href="https://dadosabertos.tse.jus.br/" target="_blank">
                dadosabertos.tse.jus.br
              </a>
            </strong>{' '}
            e baixe os seguintes arquivos:
          </p>
          <ul>
            <li>
              <strong>consulta_coligação_*</strong> — arquivo com dados de
              coligações
            </li>
            <li>
              <strong>consulta_cand_*</strong> — arquivo com dados de candidatos
            </li>
            <li>
              <strong>CESP_*</strong> — arquivo com dados de correspondências
              esperadas
            </li>
            <li>
              <strong>BWEB_*</strong>, <strong>vsec_*</strong> ou{' '}
              <strong>votacao_secao_*</strong> — arquivo do boletim web ou
              votação por seção
            </li>
          </ul>
          <hr />
          <p>
            Por exemplo, para carregar os dados do estado do <mark>Acre</mark>,
            das eleições de <mark>2018</mark>, adicione os seguintes arquivos:{' '}
          </p>
          <ul>
            <li>
              <b>consulta_coligacao_2018</b>.zip
            </li>
            <li>
              <b>consulta_cand_2018</b>.zip
            </li>
            <li>
              <b>CESP_1t_AC_061020181529</b>.zip
            </li>
            <li>
              <b>CESP_2t_AC_271020181441</b>.zip
            </li>
            <li>
              <b>BWEB_1t_AC_101020181938</b>.zip
            </li>
            <li>
              <b>BWEB_2t_AC_301020181744</b>.zip
            </li>
          </ul>
          <p>
            Os arquivos <mark>.json</mark> transformados ficam disponíveis na
            pasta: <mark>{folder}/outputs/data</mark>
          </p>
        </Block>
      </Section>
      <Section>
        <Dropper
          setLoader={setLoader}
          loader={loader}
          archived={jsons}
          refreshList={handleListRefresh}
        />
      </Section>
      <Section>{renderTable()}</Section>
    </Wrapper>
  );
};

export default Home;
