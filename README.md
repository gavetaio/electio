## Feramenta para investigação das recorrentes falhas eleitorais brasileiras

Este projeto tem origem na abertura da <a href="https://gaveta.io/g2">gaveta das eleições</a> através do `@gavetaio/liber`, com ela, surgiu a necessidade de análise e investigação dos dados eleitorais — disponíveis oficialmente via <a href="https://dadosabertos.tse.jus.br">dadosabertos.tse.jus.br</a>.

<img src="/assets/screens.png" />

Começamos com um script rodado via `command line`, que fazia uma rápida investigação das falhas expostas; porém, dada a complexidade e seriedade dos problemas encontrados, aliada à **ausência de padronização** e **obscurecimento** dos dados disponibilizados, esta análise acabou requerindo uma disposição visual dos elementos. Utilizamos então o <a href="https://github.com/electron-react-boilerplate/electron-react-boilerplate">electron-react-boilerplate</a> como base para o projeto, juntamente com o <a href="https://github.com/lerna/lerna">lernajs</a> para gerenciar a separação dos pacotes, organizando-o da seguinte forma:

- `packages/ui/base` — componentes para a base da interface
- `packages/ui/dre` — releitura da urna eletrônica
- `packages/elections` — aplicativo via electron-react-boilerplate
- `packages/engine` — engine que faz o parse e investigações nos dados eleitorais oficiais disponíveis
- `packages/core` — utils, helpers e transformers

## Da validação das falhas encontradas

Os dados gerados através desta ferramenta estão exportados, aqui mesmo no repositório, dentro da pasta `/docs`, visando a conferência e validação de toda sociedade. Em caso de inconsistências, **qualquer cidadão pode enviar um pedido de atualização** através da criação de uma `PR`, direcionando-a para a branch `civitas`. As tabelas exportadas estão organizadas da seguinte forma:

- `2018` — [Votos com o **sigilo quebrado** de forma direta](docs/expostos.md)
- `1994` — `2020` — [**Seções eleitorais anuladas** por completo](docs/anuladas.md) — sem justificativas nos dados oficiais
- `2018` — [Votos válidos excluídos pela presença de **candidatos irregulares**](docs/candidatos.md)
- `1994` — `2020` — [Votos válidos excluídos pela presença de **candidatos irregulares**](docs/excluidos.md)
- `2018` — [Porcentagem de candidatos votados em eleições proporcionais por seção eleitoral](docs/votados.md)
- `1994` — `2020` — [Resumo dos dados eleitorais capturados](docs/dados.md)

Seguindo as garantias estabelecidas pela **Lei de Transparência Pública** `Nº 12.527`, qualquer pessoa brasileira nascida pode requerer e **confirmar a validade estes dados** — basta questionar oficialmente os órgãos responsáveis. Cada um dos arquivos listados, além da tabela de dados, conta com uma descrição para a requisição dos mesmos.

## Do conceito de plataforma de pesquisa

Este projeto é uma **plataforma de pesquisa**, não um aplicativo. Pela flexibilidade necessária, não foi desenvolvida documentação, restando a evolução do projeto, agora, nas mãos da comunidade. Em caso de dúvidas, tirem-nas diretamente na leitura do código e seus links relacionados. Para melhor compreensão dos objetivos, analisem os seguites documentos, apresentados na <a href="https://gaveta.io/g2">gaveta das eleições</a> do `@gavetaio/liber`:

- `G2V1` — <a href="https://gaveta.io/g2v1">Da **constitucionalidade** do processo eleitoral brasileiro</a>
- `G2V2` — <a href="https://gaveta.io/g2v2">Da **quebra de sigilo** do voto nas eleições brasileiras</a>
- `G2V3` — <a href="https://gaveta.io/g2v3">Da **anulação de votos em massa** na urna eletrônica brasileira</a>
- `G2V4` — <a href="https://gaveta.io/g2v4">Da ruptura da **intenção de voto** do eleitor brasileiro</a>
- `G2V5` — <a href="https://gaveta.io/g2v5">Da desproporcionalidade do **direito político** brasileiro</a>

## Dos dados oficiais incompletos e a análise de votos válidos

Para que possamos finalizar nosso último estudo, que analisa o impacto da utilização da urna eletrônica nos **votos válidos** de eleições brasileiras, é crucial o acesso aos dados que estão **indisponíveis no repositório eleitoral** do órgão oficial (<a href="https://dadosabertos.tse.jus.br">dadosabertos.tse.jus.br</a>); somente após esta disponibilização, poderá ser encerrada a análise desta efetividade. Atualmente, os dados de `1994` estão parcialmente disponíveis `49%`, e, apenas `2%` dos dados das eleições de `1996` estão disponibilizados → veja a tabela com o [resumo dos dados capturados](docs/dados.md).

## Da releitura da interface da Urna Eletrônica brasileira

Para fazer a correção da interface da urna eletrônica, seguimos as indicações dispostas pela <a href="">Venice Commission</a>, <a href="https://aceproject.org/ace-en/topics/vc/onePage">ACE/IDEA</a>, <a href="https://eeas.europa.eu/archives/eueom/pdf/handbook-eueom-en-2nd-edition_en.pdf">European Commission</a>, <a href="https://www.osce.org/files/f/documents/f/8/104573.pdf">ODIHR/OSCE</a>, e pelo <a href="http://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm">Código Eleitoral</a> brasileiro em seu `A146.XIII` no que tange o cuidado com a correção de erros inadvertidos e possibilidade de confirmação do voto por parte do eleitor.

<img style="width:50%" src="/assets/legado.png" />
<img style="width:50%" src="/assets/prototipo.png" />

Tanto a versão corrigida, como a versão legada da urna eletrônica, podem ser exportados para arquivos `.html` e rodados em qualquer dispositivo — com ou sem o auxílio de mini-teclado numérico físico —, para que assim, sejam devidamente estudados e tenham seus resultados analisados pela comunidade científica.

Para maiores informações sobre a reconstrução da urna e a comprovação de suas falhas de usabilidade, acesse o documento <a href="https://gaveta.io/g2v4">G2V4 — Da ruptura da intenção de voto do eleitor brasileiro</a>.

## Das formas de participação da comunidade científica

No momento, não temos a intenção de evoluir as investigações aqui propostas, consideramos que as mesmas já atingiram o objetivo embarcado na criação do `@gavetaio/liber`. A partir de agora, o projeto está aberto, e, sua atualização, sob a responsabilidade de membros da comunidade.

- Para colaborar, envie sua `PR` para a branch <a href="https://github.com/gavetaio/electio">civitas</a>.
- Caso deseje tornar-se um membro da comunidade, com permissões de aprovação, faça o pedido juntamente com o envio de sua `PR`; no processo de aprovação de novos membros avaliamos apenas o nível de atividade de seu perfil aqui no <a href="">github</a>, evitando a participação de contas inativas.
- Caso você represente uma instituição, pedimos que, se possível, faça suas colaborações através de **perfis oficiais**.

## Da escolha da linguagem e framework de programação

Optamos por cosntruir este projeto em `javascript`, com <a href="https://nodejs.dev/">nodejs</a> e <a href="https://reactjs.org/">reactjs</a>, por sua flexibilidade e agilidade, mas, principalmente, por ser esta a maior comunidade de desenvolvedores existente no Brasil. Desta forma, visamos facilitar o engajamento na **validação dos dados** aqui expostos e também na **evolução das investigações** propostas.

## Da instalação deste projeto

Utilize os comandos abaixo para clonar, instalar e rodar o projeto. Você pode utilizar tanto `yarn` quanto `npm`.

```
git clone git@github.com:gavetaio/electio.git
cd electio
yarn install && yarn post
yarn start
```

## Dos links relacionados

- `gaveta.io/g2` — <a href="https://gaveta.io/g2">Gaveta das Eleições</a>
- `TSE` — <a href="https://dadosabertos.tse.jus.br/">Repositório de dados eleitorais</a>
- `Legislação ordinária brasileira` — <a href="https://www.tse.jus.br/legislacao/codigo-eleitoral/codigo-eleitoral-1/codigo-eleitoral-lei-nb0-4.737-de-15-de-julho-de-1965">Código Eleitoral</a>
- `Electoral Knowledge Netrwork` — <a href="https://aceproject.org/ace-en/topics/vc/onePage">ACE</a>
- `Code of good practice in electoral matters` — <a href="https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2002)023rev2-cor-e">Venice Commission</a>
- `2014`, `2016`, `2018`, `2020` — <a href="https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais">Estatísticas e resultados eleitorais</a>
- `2018`, `Pesquisa UX` — <a href="https://www.tse.jus.br/eleicoes/eleicoes-2018/estatistica-pardal">Pardal eleitoral</a>
- `2012` — <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20121:1:::NO:::">Boletim de urna</a>
- `2014` — <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::">Boletim de urna</a>
- `2016` — <a href="http://inter04.tse.jus.br/ords/eletse/f?p=107:1::::::">Boletim de urna</a>
- `2018` — <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::">Boletim de urna</a>
- `2020` — <a href="https://resultados.tse.jus.br/oficial/">Boletim de urna</a>
- `2002` — <a href="https://www.justicaeleitoral.jus.br/arquivos/tse-relarorio-resultado-eleicoes-2002">Relatório oficial das eleições</a>
- `TSE` — <a href="https://www.tse.jus.br/hotsites/catalogo-publicacoes/pdf/revista_jurisprudencia/Rj13_3.pdf">RESOLUÇÃO Nº 21.076 2002</a> — relato oficial de falhas na urna eletrônica
