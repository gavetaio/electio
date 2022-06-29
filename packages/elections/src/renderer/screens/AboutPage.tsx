import { Section, Wrapper, Block } from '@gavetaio/ui';

const AboutPage = () => {
  return (
    <Wrapper>
      <Section title="Sobre este projeto">
        <Block noMargin title="Sobre">
          <p>
            Este projeto tem origem na abertura da{' '}
            <a target="_blank" href="https://gaveta.io/g2">
              gaveta das eleições
            </a>
            ; com ela, surgiu a necessidade de fazermos uma análise dos dados
            eleitorais disponíveis. Ele começou um <i>script</i> para ser rodado
            via <mark>command line</mark>, e, fazer uma rápida análise das
            falhas expostas pelos dados eleitorais públicos disponibilizados via
            no{' '}
            <a target="_blank" href="https://dadosabertos.tse.jus.br/">
              dadosabertos.tse.jus.br
            </a>
            . Porém, dada a complexidade dos problemas encontrados, aliada a
            ausência de padronização e dos dados disponibilizados, sua análise
            acabou sendo facilitada pela disposição visual dos elementos.
          </p>
          <p>
            Utilizamos então o{' '}
            <a
              target="_blank"
              href="https://github.com/electron-react-boilerplate/electron-react-boilerplate"
            >
              electron-react-boilerplate
            </a>{' '}
            como base, juntamente com o{' '}
            <a target="_blank" href="https://github.com/lerna/lerna">
              lerna
            </a>{' '}
            para gerenciar a separação dos pacote; organizando o projeto da
            seguinte forma:
          </p>
          <ul>
            <li>
              <mark>packages/ui/base</mark> — componentes para a base da
              interface
            </li>
            <li>
              <mark>packages/ui/dre</mark> — releitura da urna eletrônica
            </li>
            <li>
              <mark>packages/core</mark> — utils/helpers/transformers
            </li>
            <li>
              <mark>packages/elections</mark> — aplicativo via{' '}
              <a
                target="_blank"
                href="https://github.com/electron-react-boilerplate/electron-react-boilerplate"
              >
                electron-react-boilerplate
              </a>
            </li>
            <li>
              <mark>packages/engine</mark> — engine que faz o parse e
              investigações nos dados disponíveis em{' '}
              <a target="_blank" href="https://dadosabertos.tse.jus.br/">
                dadosabertos.tse.jus.br
              </a>
            </li>
          </ul>
          <p>
            Para colaborar com o projeto, envie sua <mark>PR</mark> para a
            branch <a href="https://github.com/gavetaio">civitas</a>.
          </p>
          <p>
            Para tornar-se um editor do projeto, faça a requisição juntamente
            com sua <mark>PR</mark>.
          </p>
        </Block>
      </Section>
      <Section>
        <Block
          noMargin
          description="Links úteis para pesquisa e conferência dos dados apresentados"
          title="Pesquisa"
        >
          <ul>
            <li>
              <a href="https://gaveta.io/g2">Gaveta das Eleições</a> — @gavetaio
            </li>
            <li>
              <a target="_blank" href="https://dadosabertos.tse.jus.br/">
                Repositório de dados eleitorais
              </a>{' '}
              — TSE
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.tse.jus.br/legislacao/codigo-eleitoral/codigo-eleitoral-1/codigo-eleitoral-lei-nb0-4.737-de-15-de-julho-de-1965"
              >
                Código Eleitoral
              </a>{' '}
              — Legislação ordinária brasileira
            </li>
            <li>
              <a
                target="_blank"
                href="https://aceproject.org/ace-en/topics/vc/onePage"
              >
                ACE
              </a>{' '}
              — ELECTORAL NETWORK
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2002)023rev2-cor-e"
              >
                Venice Commission
              </a>{' '}
              — CODE OF GOOD PRACTICE IN ELECTORAL MATTERS
            </li>
            <li>
              <a
                target="blank"
                href="https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais"
              >
                Estatísticas e resultados
              </a>{' '}
              — 2014, 2016, 2018, 2020
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.tse.jus.br/eleicoes/eleicoes-2018/estatistica-pardal"
              >
                Pardal eleitoral
              </a>{' '}
              — 2018 (UI/UX)
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.tse.jus.br/eleicoes/eleicoes-suplementares"
              >
                Eleições suplementares
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="http://inter04.tse.jus.br/ords/eletse/f?p=20121:1:::NO:::"
              >
                Boletim de urna
              </a>{' '}
              — 2012
            </li>

            <li>
              <a
                target="_blank"
                href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::"
              >
                Boletim de urna
              </a>{' '}
              — 2014
            </li>
            <li>
              <a
                target="_blank"
                href="http://inter04.tse.jus.br/ords/eletse/f?p=107:1::::::"
              >
                Boletim de urna
              </a>{' '}
              — 2016
            </li>
            <li>
              <a
                target="_blank"
                href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::"
              >
                Boletim de urna
              </a>{' '}
              — 2018
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.justicaeleitoral.jus.br/arquivos/tse-relarorio-resultado-eleicoes-2002"
              >
                Relatório oficial das eleições
              </a>{' '}
              — 2002
            </li>
            <li>
              <a
                target="_blank"
                href="https://www.tse.jus.br/hotsites/catalogo-publicacoes/pdf/revista_jurisprudencia/Rj13_3.pdf"
              >
                RESOLUÇÃO Nº 21.076
              </a>{' '}
              — 2002
            </li>
          </ul>
        </Block>
      </Section>
    </Wrapper>
  );
};

export default AboutPage;
