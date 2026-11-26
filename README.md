# site-institucional · Argos

Front-end do projeto **Argos**. Reúne em um só repositório:

- o **site institucional**, que apresenta a empresa, o produto, os clientes e as dúvidas frequentes;
- as **telas da plataforma** (login, cadastro e painéis), usadas por três perfis: **super**, **gerente** e **analista**.

É um site estático (HTML, JavaScript puro e Tailwind CSS) que conversa com o back-end Node.js do repositório `web-data-viz` por uma API REST protegida com JWT.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Tecnologias](#2-tecnologias)
3. [Estrutura do projeto](#3-estrutura-do-projeto)
4. [Perfis e telas](#4-perfis-e-telas)
5. [Autenticação](#5-autenticação)
6. [Comunicação com o back-end](#6-comunicação-com-o-back-end)
7. [Como executar](#7-como-executar)
8. [Docker](#8-docker)
9. [Problemas comuns](#9-problemas-comuns)
10. [Limitações conhecidas e melhorias](#10-limitações-conhecidas-e-melhorias)
11. [Repositórios relacionados](#11-repositórios-relacionados)

---

## 1. Visão geral

| | |
|---|---|
| **O que é** | Site institucional da Argos e interface web da plataforma de monitoramento |
| **Público** | Visitantes (site), e usuários logados com perfil `super`, `gerente` ou `analista` |
| **Tipo** | Site estático, sem framework JavaScript. Cada tela é um `.html` com o seu `script.js` |
| **Back-end** | API REST do `web-data-viz`, endereço definido em `src/js/api.js` (`API_URL`) |
| **Sessão** | Token JWT guardado no `sessionStorage` do navegador |

---

## 2. Tecnologias

| Item | Detalhe |
|---|---|
| HTML e JavaScript | Puros, sem bundler. Scripts incluídos com `<script src>` em cada página |
| Tailwind CSS | v4, gerado pelo `@tailwindcss/cli` a partir de `src/input.css` para `src/output.css` |
| Gráficos | Chart.js, carregado por CDN (jsDelivr) nas telas com gráficos |
| Fontes | Poppins, Space Grotesk e JetBrains Mono, locais em `src/assets/fonts/` |
| Tema | Cores definidas em `src/input.css`: `main-blue`, `light-blue`, `main-purple`, `off-white` e `card` |
| Node | 20 (usado no build do Docker) |
| Servidor em produção | nginx (imagem `nginx:alpine`) |

---

## 3. Estrutura do projeto

```
site-institucional/
├── Dockerfile                    # Build do Tailwind (Node 20) + servidor nginx
├── .dockerignore
├── package.json                  # Dependências e o script "dev" do Tailwind
├── dist/output.css               # CSS copiado para o container no build
└── src/
    ├── index.html                # Página inicial (site institucional)
    ├── usuarios.html             # Gerenciar usuários (perfil super)
    ├── input.css                 # Entrada do Tailwind: tema, fontes e animações
    ├── output.css                # CSS gerado pelo Tailwind
    ├── js/
    │   ├── api.js                # API_URL, token JWT, guardas de perfil e apiFetch()
    │   └── script.js             # Login, cadastro, criação de usuário, menu e FAQ
    ├── assets/                   # fonts, icons, images, logos e patterns
    └── html/
        ├── login.html
        ├── cadastro.html
        ├── gerente/              # Telas do perfil gerente
        │   ├── home.html, script.js, relatorio.html
        │   ├── previsoes/        # Previsões (cálculos, gráficos e mapa de calor)
        │   ├── chamados/         # Histórico de chamados e detalhe
        │   ├── empresas/         # Empresas, equipamentos e componentes (CRUD)
        │   ├── funcionarios/     # Funcionários (CRUD e vínculo com empresas)
        │   └── configuracoes/
        └── analista/             # Telas do perfil analista
            ├── home/             # Equipamento, relatório de alerta e home do analista
            │   └── IndividualJoao/   # Home e lista de equipamentos usadas após o login
            └── configuracao/
```

---

## 4. Perfis e telas

O perfil vem do token (`role`). Depois do login, cada perfil é levado para a sua página inicial.

### Visitante (sem login)

| Tela | Arquivo | O que mostra |
|---|---|---|
| Página inicial | `src/index.html` | Apresentação do Argos, como o sistema funciona, equipamentos Cisco monitorados, FAQ e contato |
| Login | `src/html/login.html` | E-mail e senha |
| Cadastro | `src/html/cadastro.html` | Nome, e-mail, senha e o **token de acesso** recebido por e-mail |

### Super (`role = super`)

| Tela | Arquivo | O que faz |
|---|---|---|
| Gerenciar usuários | `src/usuarios.html` | Cria um usuário gerente informando o e-mail. O back-end envia por e-mail o token para ele concluir o cadastro |

### Gerente (`role = gerente`)

| Tela | Pasta / arquivo | O que faz |
|---|---|---|
| Home | `gerente/home.html` | Visão geral do que precisa de atenção: violações de SLA, empresas com poucos funcionários e chamados críticos |
| Previsões | `gerente/previsoes/` | Previsões de chamados: cards, mapa de calor, gráfico e tabela |
| Empresas | `gerente/empresas/` | Lista, informações e edição de empresas |
| Equipamentos | `gerente/empresas/equipamentos/` | Cadastro, informações e edição dos equipamentos de uma empresa |
| Componentes | `gerente/empresas/equipamentos/componentes/` | Cadastro, detalhes e edição dos componentes de um equipamento |
| Funcionários | `gerente/funcionarios/` | Lista, criação, edição e exclusão de funcionários, e vínculo com empresas |
| Histórico de chamados | `gerente/chamados/` | Histórico de violações de nível de serviço, com filtros por status (todos, em aberto, em atendimento, resolvidos), datas e equipamento. Há uma tela de detalhe |
| Gerar relatório | `gerente/relatorio.html` | Exporta **CSV** de telemetria por período, empresa, equipamento e métricas (CPU, RAM, disco, rede) |
| Configurações | `gerente/configuracoes/` | Configurações da conta |

### Analista (`role = analista`)

| Tela | Pasta / arquivo | O que faz |
|---|---|---|
| Home | `analista/home/IndividualJoao/home.html` | Visão geral dos dispositivos e ranking dos equipamentos com mais alertas críticos |
| Equipamentos da empresa | `analista/home/IndividualJoao/equipamentos.html` | Lista de equipamentos de uma empresa |
| Equipamento | `analista/home/equipamento.html` | Painel de um equipamento, com gráficos |
| Relatório de alerta | `analista/home/relatorio.html` | Relatório dos alertas |
| Configurações | `analista/configuracao/` | Configurações da conta |

---

## 5. Autenticação

Toda a lógica está em `src/js/api.js`.

1. O login (`authUser()` em `script.js`) envia e-mail e senha para `POST /usuarios/autenticar`.
2. O back-end devolve um **JWT**, guardado no `sessionStorage` com a chave `TOKEN` (`salvarToken`). Fechar a aba encerra a sessão.
3. `lerToken()` decodifica o conteúdo do token (`id`, `role`, `gestor`, `empresa`, `exp`) para decidir o que mostrar.
4. `paginaInicialDoCargo(role)` escolhe a página de destino: `super` vai para `usuarios.html`, `gerente` para `gerente/home.html` e os demais para a home do analista.
5. Cada tela protegida chama uma guarda ao carregar:
   - `exigirGerente()`: só deixa passar token válido, não expirado e com `role = gerente`; senão volta ao login.
   - `exigirAnalista()`: exige token válido e não expirado. Se o perfil for gerente ou super, redireciona para a página inicial dele.
6. `apiFetch(caminho, opcoes)` envia as chamadas com `Authorization: Bearer <token>`. Se o back-end responder **401**, a sessão é encerrada e o usuário volta ao login.
7. `sair()` apaga o token e volta ao login.

### Cadastro

O cadastro é por convite: o perfil `super` informa o e-mail de um gerente em `usuarios.html`, o back-end envia um **token de acesso** por e-mail, e a pessoa conclui o cadastro em `cadastro.html` com esse token.

Regras de senha validadas no navegador: mínimo de **8 caracteres**, com **1 letra maiúscula**, **1 número** e **1 caractere especial**.

> As guardas rodam no navegador e servem para a navegação. A proteção real dos dados deve estar no back-end, que valida o token em cada rota.

---

## 6. Comunicação com o back-end

O endereço do back-end fica em uma única linha de `src/js/api.js`:

```js
const API_URL = `http://localhost:8080`;
```

Para apontar para outro ambiente (servidor na nuvem, por exemplo), altere só essa linha.

### Rotas usadas

| Rota | Método | Uso |
|---|---|---|
| `/usuarios/autenticar` | POST | Login (público) |
| `/usuarios/cadastrar` | POST | Cadastro com token de acesso (público) |
| `/usuarios/cadastrar_gerente` | POST | Super convida um gerente (envia e-mail com o token) |
| `/usuarios/informacoes_usuario` | GET | Nome do usuário logado nas telas |
| `/empresa/listar_empresas` | GET | Lista de empresas (chamada sem método explícito) |
| `/dispositivos/criar_dispositivo` | POST | Cadastro de equipamento |
| `/funcionarios/listar_funcionarios` | GET | Lista de funcionários |
| `/funcionarios/criar_funcionario` | POST | Criação de funcionário |
| `/funcionarios/atualizar_funcionario` | POST | Edição de funcionário |
| `/funcionarios/deletar_funcionario` | DELETE | Exclusão de funcionário |
| `/funcionarios/listar_empresas_funcionario` | POST | Empresas vinculadas a um funcionário |
| `/funcionarios/adicionar_empresa_funcionario` | POST | Vincula uma empresa a um funcionário |
| `/funcionarios/remover_empresa_funcionario` | DELETE | Remove o vínculo |
| `/previsoes/chamados` | GET | Dados da tela de previsões |
| `/lucas/equipamento/:id` | GET | Dados do painel de um equipamento (analista) |

O método de cada rota está nas chamadas de `apiFetch` dentro dos `script.js` de cada tela. Rotas chamadas sem `method` usam GET.

### Dados de exemplo

Duas telas têm dados de exemplo no repositório:

- **Previsões:** se a rota `/previsoes/chamados` falhar, a tela usa `previsoes-dados.json` (campo interno `usandoDadosSimulados`).
- **Equipamento (analista):** `equipamento-mock.json` guarda um exemplo da estrutura esperada (dispositivo, leitura atual e histórico).

---

## 7. Como executar

### Pré-requisitos

- Node.js 20 e npm
- Back-end `web-data-viz` rodando no endereço de `API_URL` (porta 8080 por padrão)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Grupo-9-Projeto/site-institucional.git
cd site-institucional

# 2. Instale as dependências
npm install

# 3. Gere o CSS do Tailwind e deixe observando as mudanças
npm run dev
```

O `npm run dev` roda o Tailwind em modo *watch*: ele lê `src/input.css` e atualiza `src/output.css` a cada alteração nas classes.

Em outro terminal, sirva a pasta do projeto por HTTP (não abra os arquivos com duplo clique). Algumas opções:

```bash
npx serve .          # ou
python3 -m http.server 5500
```

Depois acesse `http://localhost:5500/src/index.html` (ajuste a porta). Se preferir, use a extensão **Live Server** do VS Code abrindo a pasta raiz do repositório.

> Sirva a partir da **raiz do repositório**: uma das telas carrega o script por `/src/js/api.js`, caminho que só funciona assim.

---

## 8. Docker

O `Dockerfile` tem duas etapas:

1. **build** (`node:20-alpine`): instala as dependências e gera o `output.css` minificado com o Tailwind.
2. **final** (`nginx:alpine`): copia o conteúdo de `src/` para a raiz do nginx (e também para `/src/`, por causa do caminho `/src/js/api.js`) e o CSS para `/dist/`.

```bash
docker build -t argos-site .
docker run -d --name argos-site -p 3000:80 argos-site
```

Acesse `http://localhost:3000/`.

Pontos de atenção:

- O `API_URL` é lido **no navegador**, então `localhost:8080` aponta para a máquina de quem abre o site, e não para o container. O back-end precisa estar acessível nesse endereço a partir do navegador.
- Como o back-end usa a porta 8080, publique o site em outra porta (como `3000` acima).
- Para outro ambiente, altere o `API_URL` em `src/js/api.js` **antes** do `docker build`.

---

## 9. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Página sem estilo ou com layout quebrado | `output.css` desatualizado ou não gerado | Rode `npm run dev` (ou o build do Tailwind) e recarregue |
| Volta para a tela de login sozinho | Token ausente, expirado ou perfil sem permissão para a tela | Faça login de novo com o perfil correto |
| `Não foi possível conectar ao servidor` | Back-end fora do ar ou `API_URL` errado | Suba o `web-data-viz` e confira `API_URL` em `src/js/api.js` |
| Erro de CORS no console | O back-end não libera a origem do site | Libere a origem do site no CORS do back-end |
| Scripts ou links não carregam ao abrir o `.html` direto | Página aberta por `file://` | Sirva o projeto por HTTP (seção 7) |
| Tela de previsões mostra dados que não são reais | A rota `/previsoes/chamados` falhou e a tela usou o JSON de exemplo | Confira o back-end e o token |
| Cadastro recusado | Token de acesso inválido ou senha fora das regras | Use o token enviado por e-mail e uma senha com 8+ caracteres, maiúscula, número e caractere especial |

---

## 10. Limitações conhecidas e melhorias

**Limitações atuais**

- **`API_URL` fixo no código:** é preciso editar o arquivo para trocar de ambiente. Não há arquivo de configuração nem variável de ambiente.
- **Guardas só no navegador:** `exigirGerente()` e `exigirAnalista()` não substituem a validação do back-end.
- **Caminhos de scripts inconsistentes:** o `index.html` carrega `../src/js/script.js`, a tela de previsões usa o caminho absoluto `/src/js/api.js` e as demais usam caminhos relativos de profundidades diferentes. Por isso o site precisa ser servido a partir da raiz do repositório. Além disso, a home do analista fica na pasta `IndividualJoao/`.
- **CSS duplicado:** há `output.css` na raiz, em `src/` e em `dist/`, todos versionados e podendo ficar desatualizados.
- **Dependências em excesso:** o `package.json` lista como diretas várias dependências que são internas do Tailwind (`braces`, `micromatch`, `picomatch` etc.), e o `package-lock.json` está no `.gitignore`, embora exista no repositório.
- **Sem testes automatizados:** o script `test` é o padrão do `npm init`.
- **Texto da página inicial:** o passo 4 de "Entenda como o Argos funciona" fala em notificação por Slack. Confira se isso ainda reflete o fluxo atual de alertas, que abre chamados no Jira (repositório `java-jira`).
- **Dados de exemplo no fallback:** a tela de previsões cai para dados simulados sem avisar o usuário.

**Ideias de evolução**

- Centralizar o `API_URL` (por exemplo, a partir do `window.location` ou de um `config.js` gerado no deploy).
- Padronizar a inclusão de `api.js` e `script.js` em todas as telas.
- Manter só um `output.css`, gerado no build e fora do Git.
- Limpar o `package.json` e decidir se o `package-lock.json` deve ser versionado.
- Avisar na tela quando a previsão estiver usando dados simulados.

---

## 11. Repositórios relacionados

| Repositório | Papel |
|---|---|
| [web-data-viz](https://github.com/Grupo-9-Projeto/web-data-viz) | Back-end em Node.js, consumido por este site |
| [monitoring-scripts](https://github.com/Grupo-9-Projeto/monitoring-scripts) | Coleta as métricas da máquina (`captura.py`) e roda o ETL |
| [java-jira](https://github.com/Grupo-9-Projeto/java-jira) | Lê as métricas, grava alertas e abre chamados no Jira |
| [java-spring-email](https://github.com/Grupo-9-Projeto/java-spring-email) | Serviço de envio de e-mail e cadastro de usuários |
| `database-scripts` | Scripts SQL do banco `argos_db` |
