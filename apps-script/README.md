# Apps Script (`code.gs`)

Este diretorio contem o backend para Google Apps Script que atende o frontend do jogo.

## Como usar

1. Crie uma nova planilha Google (ou use uma existente).
2. Abra `Extensoes > Apps Script`.
3. Substitua o conteudo do arquivo `Code.gs` pelo arquivo [`code.gs`](./code.gs).
4. Salve e execute a funcao `doGet` uma vez para autorizar.
5. Execute a funcao `routeAction_` via `doPost`/`doGet` usando `action=setupSheets`.
6. Execute `action=seedDemoData` para popular fases/config iniciais.
7. Faça deploy como Web App:
   - `Deploy > New deployment > Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
8. Copie a URL gerada.

## Ligacao com frontend

No projeto React, crie um arquivo `.env` com:

```bash
VITE_API_MODE=apps_script
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOY_ID/exec
```

Para validar local sem backend remoto:

```bash
VITE_API_MODE=mock
```

## Acoes de API suportadas

- `health`
- `setupSheets`
- `seedDemoData`
- `getConfig`
- `registerPlayer`
- `findPlayerByPhone`
- `getPlayerById`
- `getPhase`
- `submitResult`
- `getRanking`
- `logEvent`
