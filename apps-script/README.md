# Apps Script (`code.gs`)

Este diretorio contem o backend para Google Apps Script que atende o frontend do jogo.

## Como usar

1. Crie uma nova planilha Google (ou use uma existente).
2. Abra `Extensoes > Apps Script`.
3. Substitua o conteudo do arquivo `Code.gs` pelo arquivo [`code.gs`](./code.gs).
4. Salve e execute a funcao `doGet` uma vez para autorizar.
5. Se o projeto for standalone (nao vinculado a planilha), configure o ID da planilha:
   - opcao simples: preencha `SETTINGS.SPREADSHEET_ID` no topo do `code.gs` e execute `setSpreadsheetIdFromSettings`
   - opcao alternativa: defina `SPREADSHEET_ID` em `Project Settings > Script properties`
6. Execute `setupSheets`.
7. Execute `seedDemoData` para popular fases/config iniciais.
7. Faça deploy como Web App:
   - `Deploy > New deployment > Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
8. Copie a URL gerada.

## Provisionamento automatico (recomendado)

Se quiser criar tudo automaticamente em uma conta standalone, execute no editor:

1. `provisionGameWorkspace`

Essa funcao:

- cria a pasta `game` no Drive (se nao existir)
- cria a subpasta `labirinto` dentro de `game` (se nao existir)
- cria ou reaproveita a planilha `Game EAC - Labirinto de Palavras` dentro de `game/labirinto`
- grava o `SPREADSHEET_ID` em Script Properties
- executa `setupSheets` e `seedDemoData`

Depois execute `getSpreadsheetInfo` para confirmar ID/URL da planilha.

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
- `provisionWorkspace`
- `getConfig`
- `registerPlayer`
- `findPlayerByPhone`
- `getPlayerById`
- `getPhase`
- `submitResult`
- `getRanking`
- `logEvent`
