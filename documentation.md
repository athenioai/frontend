# Athenio.ai — Dashboard do Cliente
## Documentação do Frontend

---

## Visão Geral

O Dashboard da Athenio.ai é o painel de controle que o cliente usa para acompanhar em tempo real o que os agentes Hermes, Ares e Athena estão fazendo pela operação dele. É a prova viva de que o produto funciona — o lugar onde o cliente vê o retorno do que pagou, toda vez que faz login.

O objetivo central do dashboard não é mostrar dados bonitos. É responder uma pergunta de forma imediata e inequívoca: **"A Athenio está me fazendo ganhar dinheiro?"** Esse número precisa estar visível em menos de dois segundos após o login. É o que impede o cancelamento.

---

## Infraestrutura

- **Framework:** Next.js 14+ com App Router
- **Deploy:** Vercel
- **Estilização:** Tailwind CSS
- **Banco de dados:** Supabase (mesmo banco dos agentes — leitura via cliente Supabase com chave `anon` e Row Level Security)
- **Autenticação:** Supabase Auth
- **Tempo real:** Supabase Realtime (widgets atualizam sem reload)
- **Geração de PDF:** API Route server-side do Next.js
- **Internacionalização:** Português brasileiro em tudo — datas, moeda (R$), horário de Brasília

---

## Identidade Visual

A identidade já existe e deve ser replicada com fidelidade a partir da landing page em athenio.ai. Não inventar nada — extrair e aplicar.

**Referências obrigatórias a seguir:**
- Logo oficial: `https://athenio.ai/public/assets/logo-full.svg` — usar em todas as páginas
- Paleta de cores, tipografia, espaçamentos e componentes visuais devem espelhar a landing page existente
- Dark mode como padrão e único modo — não implementar toggle de tema
- Tom de comunicação: direto, sem jargão, focado em resultado. Nenhuma mensagem genérica de "carregando dados..." — substituir por mensagens com a voz da marca
- Ícones e microinterações devem seguir o mesmo estilo sóbrio e profissional da landing page
- Nenhum elemento visual novo que não tenha equivalente ou precedente na identidade atual

---

## Estrutura de Páginas

### `/login`
Página de autenticação do cliente. Login com e-mail e senha via Supabase Auth. Visual alinhado à landing page. Após login, redirecionar para `/dashboard`. Cada conta enxerga apenas os dados da própria empresa — isolamento via Row Level Security no Supabase.

### `/dashboard`
Página principal com todos os widgets de visão geral. Primeira coisa que o cliente vê. O número de ROI deve estar no topo, em destaque absoluto, carregando em menos de 2 segundos.

### `/funil`
Visão detalhada do funil de vendas completo, com filtro por período (hoje, 7 dias, 30 dias). Mostra onde os leads estão sendo perdidos em cada etapa da jornada.

### `/leads`
Tabela de todos os leads com: nome, telefone, temperatura (frio/morno/quente), estágio do funil, agente responsável (Hermes ou Ares), sentimento atual, produto de interesse e status de conversão. Com busca, filtros e ordenação.

### `/campanhas`
Visão de todas as campanhas ativas e pausadas no Meta Ads gerenciadas pelo Hermes. Performance individual por campanha: gasto, CPL, ROAS e status. Mostra qual campanha gerou cada venda confirmada.

### `/relatorios`
Geração e download do relatório mensal em PDF. O cliente seleciona o mês e baixa. O tom do relatório é comercial — é um documento que o cliente usa para justificar o produto para sócios ou para si mesmo.

### `/configuracoes`
Configurações do onboarding: metas de ROAS, CPL alvo, limite de orçamento diário, teto absoluto de cartão (proteção de over-budget), tom de voz do agente, número do WhatsApp para alertas humanos e dados da empresa. Esses campos são lidos pelos agentes — qualquer alteração aqui impacta o comportamento deles.

---

## Widgets do Dashboard Principal

### 1. ROI em Tempo Real — o mais importante
Topo da página. Destaque absoluto. Uma única frase em tamanho grande:

> **"Para cada R$ 1,00 investido em anúncio, a Athenio retornou R$ X,00 em vendas"**

Calculado cruzando o gasto total de anúncios (salvo pelo Athena a partir da Meta Ads API) com o valor total de vendas confirmadas pelo Ares. Atualiza em tempo real via Supabase Realtime. É o número que justifica a assinatura todo mês e é o principal argumento contra o cancelamento.

### 2. Health Score da Operação
Indicador visual de 0 a 100 mostrando a saúde geral do sistema. Calculado com base em três sinais:

- **Volume de mensagens:** queda de mais de 50% na semana em relação à semana anterior penaliza o score — pode indicar que o cliente parou de anunciar.
- **Taxa de conversão da IA:** proporção de leads que chegaram ao checkout versus total atendido pelo Ares.
- **Latência do sistema:** tempo médio de resposta dos agentes.

Se o score cair abaixo de 60, um banner de alerta aparece em todas as páginas do dashboard — não só na home — com o motivo da queda e a ação recomendada. Esse mesmo evento dispara uma notificação interna para a equipe da Athenio.ai ligar para o cliente antes que cancele.

### 3. Funil de Vendas
Gráfico de funil com 4 etapas: leads captados → leads qualificados (quentes) → em negociação com Ares → vendas confirmadas. Cada etapa mostra número absoluto e taxa de conversão para a próxima. Deixa evidente onde os leads estão saindo do funil.

### 4. LTV e CAC
Dois cards lado a lado:
- **LTV médio:** `(Ticket Médio Mensal × Tempo Médio de Retenção) + Setup`. Quanto cada cliente vale ao longo do tempo.
- **CAC:** gasto total em anúncios dividido pelo número de vendas confirmadas. Quanto custa adquirir um cliente.

Abaixo, um gráfico de barras acumulado com o LTV individual dos últimos clientes convertidos — o dono vê o valor que cada um trouxe ao longo do tempo, não só o ticket da primeira venda.

### 5. Top Objeções dos Leads
Gráfico mostrando os principais motivos pelos quais leads não estão comprando. Dados extraídos em tempo real do campo `objections` dos perfis de lead pelo Ares. Categorias típicas: preço, prazo, desconfiança, não entendeu o produto, concorrente. É o widget que mais surpreende o cliente — ele vê padrões que nunca veria lendo conversa por conversa.

### 6. Economia de Tempo da IA
Card simples com um número em destaque:

> **"Este mês, a Athenio economizou X horas de trabalho humano"**

Calculado pelo volume de conversas atendidas multiplicado pelo tempo médio estimado de atendimento manual. Número concreto que reforça o valor do produto além da receita direta.

### 7. Atividade dos Agentes
Três cards — um por agente — com nome, status atual e resumo das últimas 24h:

- **Hermes:** campanhas ativas, leads em nutrição, último criativo gerado, próximo ciclo de otimização.
- **Ares:** conversas ativas agora, vendas fechadas hoje, follow-ups agendados, leads aguardando resposta.
- **Athena:** horário e resumo do último ciclo de varredura, última decisão financeira tomada, alertas disparados.

### 8. Feed de Alertas
Lista cronológica dos eventos mais recentes: vendas confirmadas, campanhas pausadas ou escaladas, leads classificados como baleia (alto valor), intervenções humanas solicitadas e anomalias de segurança detectadas. Cada item tem ícone, descrição curta e timestamp.

---

## Relatório Mensal em PDF

Gerado server-side via API Route do Next.js. Disponível na página `/relatorios` para download a qualquer momento. Tom comercial — o cliente usa para justificar o produto para sócios, diretores ou para si mesmo.

Conteúdo do relatório:
- Resumo executivo do mês (leads, conversões, ROAS médio)
- Quantos leads a IA recuperou via remarketing e o valor financeiro representado
- Evolução do ROI nos últimos 3 meses (linha do tempo)
- Top 3 campanhas por ROAS
- Top 3 objeções do período e o que elas indicam
- Health Score médio do mês
- Horas de trabalho humano economizadas

---

## Autenticação e Multi-tenant

Cada cliente acessa apenas os dados da própria empresa. O isolamento é feito via `empresa_id` no Supabase com Row Level Security ativa em todas as tabelas. O middleware do Next.js valida a sessão em todas as rotas protegidas e redireciona para `/login` se não autenticado.

---

## Painel Admin (`/admin`) — uso interno da Athenio.ai

Visível apenas para a equipe da Athenio.ai. Mostra todos os clientes ativos em uma tabela com: nome da empresa, Health Score atual, ROAS do mês, data do último alerta e status da assinatura. Clientes com Health Score abaixo de 60 aparecem no topo, destacados — são os candidatos a cancelamento que precisam de atenção imediata. Clicar em um cliente abre o dashboard completo daquele cliente em modo visualização (sem edição).

Esse painel é o sistema de retenção ativa da Athenio.ai: identifica quem está em risco antes que o cliente peça o cancelamento.

---

## Conexão com os Agentes

O frontend é somente leitura em relação aos agentes. Ele nunca escreve nas tabelas operacionais dos agentes. A única exceção é `/configuracoes`, onde o cliente atualiza as metas de onboarding que os agentes leem para tomar decisões.

Todas as leituras usam Row Level Security no Supabase. O frontend usa exclusivamente a chave `anon` — nunca a `service_role`.

---

## Tabelas do Supabase que o frontend lê

| Tabela | O que exibe no dashboard |
|---|---|
| `lead_profiles` | Página de leads, funil, objeções, temperatura atual |
| `campaigns` | Página de campanhas, ROI, ROAS por campanha |
| `conversations` | Volume de mensagens, economia de horas |
| `payment_logs` | Vendas confirmadas, LTV, CAC |
| `orchestrator_decisions` | Feed de alertas, atividade do Athena |
| `self_reflect_reports` | Resumo do último ciclo do Athena |
| `conversation_summaries` | Contexto dos leads na tabela de leads |

---

## Regras de produto

- O widget de ROI carrega em menos de 2 segundos. É o primeiro número visível após o login.
- Todos os widgets com dados em tempo real usam Supabase Realtime — sem polling.
- O relatório PDF é sempre gerado server-side via API Route — nunca no browser.
- O layout é mobile-first. O cliente precisa ver o ROI e o Health Score no celular sem scroll.
- Health Score abaixo de 60 exibe o banner de alerta em todas as páginas, não apenas no dashboard.
- Nenhuma chave `service_role` do Supabase aparece no código client-side, em nenhuma circunstância.
- Todo texto da interface usa o mesmo tom da landing page: direto, sem jargão, focado em resultado.
- Datas em português brasileiro, moeda em R$, horários no fuso de Brasília (America/Sao_Paulo).
