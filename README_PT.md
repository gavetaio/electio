## Feramenta para investigação das recorrentes falhas eleitorais brasileiras

Este projeto tem origem na abertura da <a href="https://gaveta.io/g2"><b>gaveta das eleições</b></a> através do <b>`@gavetaio/liber`</b>, com ela, surgiu a necessidade de análise e investigação dos dados eleitorais — disponíveis oficialmente via <a href="https://dadosabertos.tse.jus.br"><b>dadosabertos.tse.jus.br</b></a>.

<img src="/assets/screens.png" style="width: 720px;" />

Começamos com um script rodado via <b>`command line`</b>, que fazia uma rápida investigação das falhas expostas; porém, dada a complexidade e seriedade dos problemas encontrados, aliada à **ausência de padronização** e **obscurecimento** dos dados disponibilizados, esta análise acabou requerindo uma disposição visual dos elementos. Utilizamos então o <a href="https://github.com/electron-react-boilerplate/electron-react-boilerplate"><b>electron-react-boilerplate</b></a> como base para o projeto, juntamente com o <a href="https://github.com/lerna/lerna"><b>lernajs</b></a> para gerenciar a separação dos pacotes, organizando-o da seguinte forma:

- `packages/ui/base` — componentes para a base da interface
- `packages/ui/dre` — releitura da urna eletrônica
- `packages/elections` — aplicativo via electron-react-boilerplate
- `packages/engine` — engine que faz o parse e investigações nos dados eleitorais oficiais disponíveis
- `packages/core` — utils, helpers e transformers

## Da carta aberta aos desenvolvedores de software

<blockquote>
  <i>Disponibilizamos neste repositório o código que analisa os <a href="https://dadosabertos.tse.jus.br"><b>dados oficiais do repositório eleitoral</b></a>, nele, demonstramos as recorrentes <a href="https://gaveta.io/eleicoes/documentos/G2V3"><b>falhas na urna eletrônica</b></a> e no <a href="https://gaveta.io/eleicoes/documentos"><b>processo eleitoral brasileiro</b></a>; estas falhas, comprovadamente, <a href="https://gaveta.io/eleicoes/documentos/G2V3"><b>alteraram o resultado final</b></a> de inúmeras eleições nacionais. Entenda que, este projeto, não é sobre os extremos da curva, não é sobre partidos e tão pouco sobre ideologias; este projeto é sobre programadores, pedindo aos demais programadores, para que revisem seu código, e, <b>provem que estamos errados</b>. A República está tomada por afirmações inscientes e totalitárias; palavras são relativizadas, o pensamento humano é relativizado, porém, a lógica de programação, ainda é <A href="https://www.google.com/search?q=booleano+significado">booleana</a>. Portanto, por favor, <b>provem que estamos errados</b>: provem que os <a href="https://gaveta.io/eleicoes/documentos/G2V3"><b>185 mil votos anulados</b></a> de forma arbitrária entre <b>1998</b> e <b>2020</b> — «não existiram»; provem que a explosão de votos perdidos por <a href="https://gaveta.io/eleicoes/documentos/G2V3"><b>falhas em urnas eletrônicas</b></a> entre <b>1998</b> e <b>2002</b> (<a href="https://www.tse.jus.br/hotsites/catalogo-publicacoes/pdf/revista_jurisprudencia/Rj13_3.pdf"><b>TSE: RESOLUÇÃO Nº 21.076/2002</b></a>), «não existiu»; provem que este facto não se repetiu nas eleições de <b>2020</b> em <b>Irupi/ES</b> (<a href="https://tre-es.jusbrasil.com.br/jurisprudencia/1194194868/recurso-eleitoral-re-60056186-irupi-es/inteiro-teor-1194194899"><b>RE060056186</b></a>) e <b>Várzea Paulista/SP</b>; provem que os <b>4.232 votos válidos</b> com o <a href="https://gaveta.io/eleicoes/documentos/G2V2"><b>sigilo quebrado nas eleições de 2018</b></a> — «não ocorreram»; provem que a urna eletrônica não contraria todo princípio fundamental de controle de erro do usuário, e que esta insciência não foi <a href="https://gaveta.io/eleicoes/documentos/G2V4"><b>responsável pela explosão de votos nulos</b></a>, afetando — até hoje — a integridade de toda eleição brasileira. Em um século onde a realidade colocada em palavras é facilmente descartada, a lógica de programação é ferramenta singular para cercear toda e qualquer manifestação sofista; dito isso, programador, a resolução deste problema resta — literalmente — em suas mãos, honre sua posição, e, por favor, <b>prove que estamos errados</b>.</i>
</blockquote>

Para maiores informações técnicas a respeito do processo eleitoral brasileiro, sua estrutura em comparação aos princípios democráticos ocidentais e o impacto das recorrentes falhas apresentadas, acesse a <a href="https://gaveta.io/G2T1"><b>trilha de conhecimento #G2T1</b></a> diretamente no <b>`@gavetaio/liber`</b>.

## Da validação das falhas encontradas

Os dados gerados através desta ferramenta estão exportados, aqui mesmo no repositório, dentro da pasta <b>`/docs`</b>, visando a conferência e validação de toda sociedade. Em caso de inconsistências, **qualquer cidadão pode enviar um pedido de atualização** através da criação de uma <b>`PR`</b>, direcionando-a para a branch <b>`civitas`</b>. As tabelas exportadas estão organizadas da seguinte forma:

- `2018` — [Votos com o **sigilo quebrado** de forma direta](docs/expostos.md)
- `1994` — `2020` — [**Seções eleitorais anuladas** por completo](docs/anuladas.md) — sem justificativas nos dados oficiais
- `2018` — [Votos válidos excluídos pela presença de **candidatos irregulares**](docs/candidatos.md)
- `1994` — `2020` — [Votos válidos excluídos pela presença de **candidatos irregulares**](docs/excluidos.md)
- `2018` — [Porcentagem de candidatos votados em eleições proporcionais por seção eleitoral](docs/votados.md)
- `1994` — `2020` — [Resumo dos dados eleitorais capturados](docs/dados.md)

Seguindo as garantias estabelecidas pela **Lei de Transparência Pública** <b>`Nº 12.527`</b>, qualquer pessoa brasileira nascida pode requerer e **confirmar a validade estes dados** — basta questionar oficialmente os órgãos responsáveis. Cada um dos arquivos listados, além da tabela de dados, conta com uma descrição para a requisição dos mesmos.

## Do conceito de plataforma de pesquisa

Este projeto é uma **plataforma de pesquisa**, não um aplicativo. Pela flexibilidade necessária, não foi desenvolvida documentação, restando a evolução do projeto, agora, nas mãos da comunidade. Em caso de dúvidas, tirem-nas diretamente na leitura do código e seus links relacionados. Para melhor compreensão dos objetivos, analisem os seguites documentos, apresentados na <a href="https://gaveta.io/g2"><b>gaveta das eleições</b></a> do <b>`@gavetaio/liber`</b>:

- `G2V1` — <a href="https://gaveta.io/g2v1">Da **constitucionalidade** do processo eleitoral brasileiro</a>
- `G2V2` — <a href="https://gaveta.io/g2v2">Da **quebra de sigilo** do voto nas eleições brasileiras</a>
- `G2V3` — <a href="https://gaveta.io/g2v3">Da **anulação de votos em massa** na urna eletrônica brasileira</a>
- `G2V4` — <a href="https://gaveta.io/g2v4">Da ruptura da **intenção de voto** do eleitor brasileiro</a>
- `G2V5` — <a href="https://gaveta.io/g2v5">Da desproporcionalidade do **direito político** brasileiro</a>

## Da releitura da interface da Urna Eletrônica brasileira

Para fazer a correção da interface da urna eletrônica, seguimos as indicações dispostas pela <a href="https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2002)023rev2-cor-e"><b>Venice Commission</b></a>, <a href="https://aceproject.org/ace-en/topics/vc/onePage"><b>ACE/IDEA</b></a>, <a href="https://eeas.europa.eu/archives/eueom/pdf/handbook-eueom-en-2nd-edition_en.pdf"><b>European Commission</b></a>, <a href="https://www.osce.org/files/f/documents/f/8/104573.pdf"><b>ODIHR/OSCE</b></a>, e pelo <a href="http://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm">Código Eleitoral</a> brasileiro em seu <b>`A146.XIII`</b> no que tange o cuidado com a correção de erros inadvertidos e possibilidade de confirmação do voto por parte do eleitor.

Tanto a versão corrigida, como a versão legada da urna eletrônica, podem ser exportados para arquivos <b>`.html`</b> e rodados em qualquer dispositivo — com ou sem o auxílio de mini-teclado numérico físico —, para que assim, sejam devidamente estudados e tenham seus resultados analisados pela comunidade científica.

<img src="/assets/prototipo.png"  style="width: 720px;" />

Para maiores informações sobre a reconstrução da urna e a comprovação de suas falhas de usabilidade, acesse o documento <a href="https://gaveta.io/g2v4"><b>G2V4 — Da ruptura da intenção de voto do eleitor brasileiro</b></a>.

## Dos dados oficiais incompletos e a análise de votos válidos

Para que possamos finalizar nosso último estudo, que analisa o impacto da utilização da urna eletrônica nos **votos válidos** de eleições brasileiras, é crucial o acesso aos dados que estão **indisponíveis no repositório eleitoral** do órgão oficial (<a href="https://dadosabertos.tse.jus.br">dadosabertos.tse.jus.br</a>); somente após esta disponibilização, poderá ser encerrada a análise desta efetividade. Atualmente, os dados de <b>`1994`</b> estão parcialmente disponíveis <b>`49%`</b>, e, apenas <b>`2%`</b> dos dados das eleições de <b>`1996`</b> estão disponibilizados → veja a tabela com o <b>[resumo dos dados capturados](docs/dados.md)</b>.

## Das formas de participação da comunidade científica

No momento, não temos a intenção de evoluir as investigações aqui propostas, consideramos que as mesmas já atingiram o objetivo embarcado na criação do <b>`@gavetaio/liber`</b>. A partir de agora, o projeto está aberto, e, sua atualização, sob a responsabilidade de membros da comunidade.

- Para colaborar, envie sua <b>`PR`</b> para a branch <a href="https://github.com/gavetaio/electio"><b>civitas</b></a>.
- Caso deseje tornar-se um membro da comunidade, com permissões de aprovação, faça o pedido juntamente com o envio de sua <b>`PR`</b>; no processo de aprovação de novos membros avaliamos apenas o nível de atividade de seu perfil aqui no <b>Github</b>, evitando a participação de contas inativas.
- Caso você represente uma instituição, pedimos que, se possível, faça suas colaborações através de **perfis oficiais**.

## Da escolha da linguagem e framework de programação

Optamos por cosntruir este projeto em <b>`javascript`</b>, com <a href="https://nodejs.dev/"><b>`nodejs`</b></a> e <a href="https://reactjs.org/"><b>`reactjs`</b></a>, por sua flexibilidade e agilidade, mas, principalmente, por ser esta a maior comunidade de desenvolvedores existente no Brasil. Desta forma, visamos facilitar o engajamento na **validação dos dados** aqui expostos, e também na **evolução das investigações** propostas.

## Da instalação deste projeto

Utilize os comandos abaixo para clonar, instalar e rodar o projeto. Você pode utilizar tanto <b>`yarn`</b> quanto <b>`npm`</b>.

```
git clone git@github.com:gavetaio/electio.git
cd electio
yarn install && yarn post
yarn start
```

## Dos links relacionados

- <b>`gaveta.io/g2`</b> → <a href="https://gaveta.io/g2">Gaveta das Eleições</a>
- <b>`TSE`</b> → <a href="https://dadosabertos.tse.jus.br/">Repositório de dados eleitorais</a>
- <b>`Legislação ordinária brasileira`</b> → <a href="https://www.tse.jus.br/legislacao/codigo-eleitoral/codigo-eleitoral-1/codigo-eleitoral-lei-nb0-4.737-de-15-de-julho-de-1965">Código Eleitoral</a>
- <b>`Electoral Knowledge Netrwork`</b> → <a href="https://aceproject.org/ace-en/topics/vc/onePage">ACE</a>
- <b>`Code of good practice in electoral matters`</b> → <a href="https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2002)023rev2-cor-e">Venice Commission</a>
- <b>`2014`, `2016`, `2018`, `2020`</b> → <a href="https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais">Estatísticas e resultados eleitorais</a>
- <b>`2018`, `Pesquisa UX`</b> → <a href="https://www.tse.jus.br/eleicoes/eleicoes-2018/estatistica-pardal">Pardal eleitoral</a>
- <b>`2012`</b> → <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20121:1:::NO:::">Boletim de urna</a>
- <b>`2014`</b> → <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::">Boletim de urna</a>
- <b>`2016`</b> → <a href="http://inter04.tse.jus.br/ords/eletse/f?p=107:1::::::">Boletim de urna</a>
- <b>`2018`</b> → <a href="http://inter04.tse.jus.br/ords/eletse/f?p=20103:1::::::">Boletim de urna</a>
- <b>`2020`</b> → <a href="https://resultados.tse.jus.br/oficial/">Boletim de urna</a>
- <b>`2002`</b> → <a href="https://www.justicaeleitoral.jus.br/arquivos/tse-relarorio-resultado-eleicoes-2002">Relatório oficial das eleições</a>
- <b>`RESOLUÇÃO TSE Nº 21.076/2002`</b> → <a href="https://www.tse.jus.br/hotsites/catalogo-publicacoes/pdf/revista_jurisprudencia/Rj13_3.pdf">relatório oficial</a> do `GESTOT` que confirma falhas na urna eletrônica no início do século (<b>Página. 364</b>)
