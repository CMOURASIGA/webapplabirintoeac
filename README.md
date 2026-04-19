# Game EAC - Labirinto de Palavras

Aplicacao web mobile-first para fases de labirinto com palavras reflexivas, ranking, pontuacao e compartilhamento.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Modo de API:
  - `mock` (localStorage)
  - `apps_script` (Google Apps Script / Sheets)

## Rodar local para validacao

```bash
npm install
npm run dev
```

Abra o link local do Vite (`http://localhost:5173` por padrao).

## Configuracao de ambiente

Use `.env`:

```bash
VITE_API_MODE=mock
VITE_APPS_SCRIPT_URL=
```

- `mock`: valida tudo localmente sem backend remoto.
- `apps_script`: usa o endpoint do Web App do Google Script.

## Fluxo principal implementado

- Boas-vindas
- Cadastro de jogador
- Recuperacao por telefone
- Home com progresso
- Fase do labirinto
- Validacao da palavra
- Resultado + reflexao
- Ranking
- Compartilhamento
- Final da jornada

## Backend Google Apps Script

O backend para Google Sheets esta em:

- [`apps-script/code.gs`](./apps-script/code.gs)
- [`apps-script/README.md`](./apps-script/README.md)

Esse `code.gs` ja inclui:

- criacao de abas e cabecalhos (`setupSheets`)
- seed de dados iniciais (`seedDemoData`)
- endpoints para jogador, fase, resultado, ranking e logs
