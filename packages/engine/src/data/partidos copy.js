export const PARTIDOS = `Movimento Democrático Brasileiro | MDB | 15
Partido dos Trabalhadores | PT | 13
Partido da Social Democracia Brasileira | PSDB | 45
Progressistas | PP | 11
Partido Democrático Trabalhista | PDT | 12
Partido Trabalhista Brasileiro | PTB | 14
Democratas | DEM | 25
Partido Liberal | PL | 22
Partido Socialista Brasileiro | PSB | 40
Republicanos | Republicanos | 10
Cidadania | Cidadania | 23
Partido Social Cristão | PSC | 20
Partido Comunista do Brasil | PCdoB | 65
Podemos | PODE | 19
Partido Social Democrático | PSD | 55
Partido Verde | PV | 43
Patriota | Patriota | 51
Solidariedade | Solidariedade | 77
Partido Socialismo e Liberdade | PSOL | 50
Avante | Avante | 70
Partido da Mobilização Nacional | PMN | 33
Partido Trabalhista Cristão | PTC | 36
Democracia Cristã | DC | 27
Partido Renovador Trabalhista Brasileiro | PRTB | 28
Partido Republicano da Ordem Social | PROS | 90
Partido Social Liberal | PSL | 17
Partido da Mulher Brasileira | PMB | 35
Rede Sustentabilidade | REDE | 18
Partido Novo | NOVO | 30
Partido Socialista dos Trabalhadores Unificado | PSTU | 16
Partido Comunista Brasileiro | PCB | 21
Partido da Causa Operária | PCO | 29
Unidade Popular | UP | 80
Partido Pátria Livre | PPL | 54
Partido Republicano Progressista | PRP | 44
REDE SUSTENTABILIDADE | REDE | 31`;

export const getPartidosInfo = () => {
  const list = PARTIDOS.split('\n');
  const result = [];
  list.forEach((line) => {
    const split = line.split('|');
    const partido = {
      nome: split[0].trim(),
      sigla: split[1].trim(),
      numero: split[2].trim(),
    };
    result.push(partido);
  });

  return result;
};

export const getPartidoData = (number) => {
  const partidos = getPartidosInfo();
  const result = partidos.find((partido) => partido.numero === `${number}`);

  return result || null;
};
