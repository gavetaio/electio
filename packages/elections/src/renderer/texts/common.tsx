import { Block } from '@gavetaio/ui';

const common = {
  simulador: {
    legado: () => (
      <Block
        noMargin
        title="Detalhes"
        description="Dos parâmetros utilizados no desenvolvimento do protótipo corrigido da urna eletrônica"
      >
        <p>
          Este é o protótipo que emula a atual interface da urna eletrônica
          brasileira. Procuramos manter-nos fidedignos <s>à ausência de</s>{' '}
          <i>aos padrões</i> de alinhamento dos elementos presentes em tela.
          Importante destacar que, a peculiar a falta de coerção em seu
          posicionamento, indica a ausência de componentização modularizada da
          interface; esta factualidade, além de estagnar a velocidade de
          desenvolvimento, afeta diretamente o entendimento do usuário, devido à
          sua elevada desconexão lógica. Mais detalhes em{' '}
          <a target="_blank" href="https://gaveta.io/g2v4">
            gaveta.io/g2v4
          </a>{' '}
          —{' '}
          <strong>Da ruptura da intenção de voto do eleitor brasileiro</strong>.
        </p>
        <p>
          Estamos carregando os dados do primeiro turno das eleições do{' '}
          <b>Acre</b> do ano de <b>2018</b>, carregados por padrão neste
          projeto.
        </p>
      </Block>
    ),
    refatorado: () => (
      <Block
        noMargin
        title="Detalhes"
        description="Dos parâmetros utilizados no desenvolvimento do protótipo corrigido da urna eletrônica"
      >
        <p>
          Este é o protótipo corrigido da urna eletrônica brasileira; em seu
          desenvolvimento, seguimos os seguintes conceitos:
        </p>
        <ul>
          <li>
            Mantido o caminho raíz de votação — respeitando a familiaridade do
            usuário.
          </li>
          <li>
            Mantidos atuais elementos da interface — respeitando a limitação do
            tempo de desenvolvimento em cima de uma interface legada com 10
            milhões de linhas de código.
          </li>
          <li>
            Seguimos as indicações da <b>Venice Commission</b>, <b>ACE/IDEA</b>,{' '}
            <b>European Commission</b>, <b>ODIHR/OSCE</b>, e do{' '}
            <b>Código Eleitoral</b> brasileiro (<b>A146.XIII</b>) no que tange o
            cuidado com a correção de erros inadvertidos e possibilidade de
            confirmação do voto por parte do eleitor.
          </li>
          <li>
            Foi mantida a <i>estranha</i> possibilidade do voto nulo, porém, a
            mesma ganhou 1 (uma) camada extra em sua ação e 1 (uma) tela extra
            de confirmação. Para anular o voto, o eleitor precisa digitar um
            número inválido e pressionar o botão <b>CONFIRMA</b> por{' '}
            <b>5 segundos</b>.
          </li>
          <li>
            O botão <b>CORRIGE</b> acaba ganhando vital importância, visto que
            possibilita ao eleitor, a qualquer momento, pressioná-lo por{' '}
            <b>5 segundos</b> para reiniciar seu voto. Esta funcionalidade visa
            também auxiliar o eleitor com dificuldades votações com mais de 2
            cargos, dada a auxência do registro em tela de sua evolução.
          </li>
          <li>
            O texto no rodapé da tela, é preenchido especificamente com base na
            ação do usuário, auxiliando este na decisão de sua próxima ação para
            continuar ou finalizar seu voto.
          </li>
          <li>
            O <i>blink</i> que indica erro de ação foi desenvolvido para além de
            alertar, auxiliar o eleitor na decisão da escolha do próximo botão a
            ser utilizado — através da cor do fundo de tela.
          </li>
        </ul>
        <p>
          Em um teste simples, com um modelo baseado nas estatísticas eleitorais
          dos últimos 4 ciclos, e erros modelados através das reclamações do
          Pardal eleitoral:{' '}
          <strong>a redução do erro inadvertido ficou em (83 ± 5)%</strong>; o
          que afetaria de <strong>2% a 4% dos votos válidos</strong> para
          eleições majoritárias em votações com <b>5 cargos</b> disponíveis.
          Veja mais detalhes no documento{' '}
          <a target="_blank" href="https://gaveta.io/g2v4">
            gaveta.io/g2v4
          </a>{' '}
          —{' '}
          <strong>Da ruptura da intenção de voto do eleitor brasileiro</strong>.
        </p>
        <p>
          Estamos carregando os dados do primeiro turno das eleições do{' '}
          <b>Acre</b> do ano de <b>2018</b>, carregados por padrão neste
          projeto.
        </p>
      </Block>
    ),
  },
};

export default common;
