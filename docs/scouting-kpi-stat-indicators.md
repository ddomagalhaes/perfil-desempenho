# Indicadores estatísticos para os KPIs de scouting — RASCUNHO

**Estado: rascunho técnico, não validado pelo departamento.** Segue a mesma lógica das
"bandas" em [`lib/scouting-kpi/kpiData.ts`](../lib/scouting-kpi/kpiData.ts): uma proposta
de partida para discutir e corrigir com quem conhece o jogo, não uma versão final.

## O que é isto

Para cada KPI "por jogo" (os que têm critérios observáveis em vídeo/eventos — ver
`criteriosVideo` em `kpiData.ts`), este documento propõe **um indicador estatístico**
que poderia ser calculado a partir de dados de eventos de jogo (tipo Wyscout/Opta:
cada ação com minuto, tipo, resultado, posição x/y), e que serviria para uma
**avaliação automática a mostrar ao lado da do scout** — nunca a substituir.

Isto é só a camada "modelo" (fórmula). A camada "dados" (de onde vêm os eventos)
continua bloqueada — ver `project-wyscout-integration-plan` na memória. Quando essa
parte se resolver, isto já está pensado para ligar lá.

## Como cada indicador vira nota 0-10

1. Calcula-se o indicador bruto por 90 minutos jogados.
2. Converte-se em 0-10 por **percentil dentro dos nossos próprios prospetos da mesma
   posição** — nunca "global" (não temos população para isso; ver `getProspectProfile`
   em `lib/data/scoutingEvaluations.ts`, que já usa este princípio para as avaliações
   do scout).
3. Só se mostra quando houver um mínimo de jogos com dados (sugestão: 3); antes disso,
   mostra-se "dados insuficientes", como já fazemos no perfil.
4. Mostra-se sempre com uma etiqueta **"automático"**, o número de jogos por trás, e
   nunca se mistura com o valor do scout — ficam lado a lado, como foi combinado.

## KPIs "por jogo" (peso total 62/100) — têm proxy estatístico razoável

### Coragem (peso 8)
- **Indicador:** dribles/arranques tentados por 90 + remates tentados de fora da área
  por 90. Mede exposição ao risco, não o resultado da ação.
- **Campos necessários:** eventos de drible (x, y, resultado), eventos de remate (x, y).
- **Limitação:** não sabemos se havia marcação apertada no momento (isso exige dados
  de pressão/tracking, que o pacote de eventos "standard" normalmente não tem) — por
  isso o indicador mede exposição, não coragem "sob pressão" como o critério original
  pede. É uma aproximação, não o critério literal.

### Agressividade (peso 4)
- **Indicador:** duelos disputados por 90 (terrestres + aéreos), contando participação,
  não vitórias — mede procura do confronto, não eficácia nele.
- **Campos necessários:** eventos de duelo (tipo, resultado).

### Resiliência (peso 10)
- **Indicador:** nível de envolvimento (ações ofensivas + defensivas) nos últimos 15
  minutos da parte, quando a equipa está a perder, comparado com a média pessoal do
  resto do jogo.
- **Campos necessários:** todos os eventos com minuto + eventos de golo (para calcular
  o estado do jogo a cada minuto) — é exactamente a tabela "estado de jogo × janela de
  15 min" do plano original.
- **Nota:** este é o indicador mais próximo do que tínhamos planeado desde o início.

### Autoconfiança (peso 6)
- **Indicador:** (remates tentados + toques na área adversária) por 90, normalizado
  pela posição, mais um sinal binário "é o marcador designado de grandes penalidades
  ou livres" se esse dado existir.
- **Campos necessários:** eventos de remate e de toque/posse por zona; marcação de
  quem bateu bolas paradas.

### Autocontrolo (peso 6)
- **Indicador:** 1 − (faltas cometidas nos ~60s a seguir a perder a bola ou a sofrer
  falta) ÷ (nº de vezes que isso aconteceu). Quanto menos reage mal a seguir a um
  momento de adversidade, mais alto o score.
- **Campos necessários:** sequência de eventos com minuto/segundo (para ligar uma
  falta cometida à perda de bola ou falta sofrida imediatamente anterior).

### Altruísmo (peso 4)
- **Indicador:** rácio assistências/passes-chave por remate tentado, quando em zona de
  finalização — prefere servir a rematar. Como segundo sinal (mais difícil): ações
  defensivas fora da sua zona habitual no campo.
- **Campos necessários:** eventos de passe-chave/assistência, remate, e posição x/y de
  cada ação (para calcular a "zona habitual" de cada jogador ao longo da época).

### Atitude competitiva (peso 10)
- **Indicador:** consistência do nº de ações por intervalo de 15 minutos ao longo do
  jogo (desvio-padrão baixo = mantém-se sempre ativo, não só quando a bola está perto).
- **Campos necessários:** todos os eventos com minuto.

### Tomada de decisão (peso 14)
- **Indicador:** interceções por 90 + taxa de sucesso de passes progressivos
  (passes que avançam a bola de forma significativa em direção à baliza adversária).
- **Campos necessários:** eventos de interceção; eventos de passe com x/y de início e
  fim (para calcular "progressivo").

## KPIs periódicos (peso total 38/100) — sem proxy estatístico razoável

Confirma o que já tínhamos concluído: estes continuam a ser avaliação do scout,
não de dados. Não vale a pena fingir um indicador só para ter um número.

- **Criatividade** (peso 12): só seria possível um proxy muito especulativo
  (diversidade estatística das zonas/tipos de ação usadas ao longo de várias
  jornadas), com baixíssima confiança. Não recomendo construir isto sem o
  departamento concordar explicitamente que aceita essa aproximação.
- **Comunicação** (peso 8): precisa de áudio ou presença ao vivo. Sem proxy.
- **Liderança** (peso 8): no máximo um sinal fraquíssimo ("é capitão"), que não
  substitui observação humana. Sem proxy credível.
- **Ambição** (peso 10): a tendência de melhoria das métricas pessoais época a época
  (como o "career arc" do Mind Stats) mistura-se com contexto de equipa e de treino —
  pode servir como informação de apoio, nunca como pontuação do KPI.

## Próximos passos, pela ordem que fazem sentido

1. Validar com o departamento se as aproximações acima (sobretudo Coragem e
   Autoconfiança, que se afastam mais da definição original) são aceitáveis ou se
   precisam de ajuste.
2. Resolver o acesso a uma fonte de eventos de jogo (Wyscout ou outra).
3. Implementar o cálculo real por cima dos dados, reutilizando `bandaParaValor` e o
   padrão de percentil "dentro dos nossos prospetos" já usado em `getProspectProfile`.
