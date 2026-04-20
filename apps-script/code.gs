var SHEETS = {
  CONFIG: "CONFIG",
  PALAVRAS: "PALAVRAS",
  LABIRINTOS: "LABIRINTOS",
  JOGADORES: "JOGADORES",
  RESULTADOS: "RESULTADOS",
  RANKING: "RANKING",
  LOG_EVENTOS: "LOG_EVENTOS"
};

var HEADERS = {
  CONFIG: ["chave", "valor"],
  PALAVRAS: ["id_fase", "ordem_palavra", "palavra_correta", "mensagem", "reflexao"],
  LABIRINTOS: ["id_fase", "ordem_palavra", "grid_json", "inicio", "fim"],
  JOGADORES: [
    "id_jogador",
    "nome",
    "apelido",
    "telefone",
    "pontuacao_total",
    "tempo_total_segundos",
    "fases_concluidas",
    "fase_atual",
    "palavra_atual_fase",
    "data_criacao"
  ],
  RESULTADOS: [
    "id_jogador",
    "id_fase",
    "ordem_palavra",
    "palavra_formada",
    "palavra_correta",
    "acertou",
    "tentativas",
    "tempo_segundos",
    "pontuacao",
    "data"
  ],
  RANKING: [
    "posicao",
    "id_jogador",
    "nome",
    "apelido",
    "pontuacao_total",
    "fases_concluidas",
    "tempo_total_segundos"
  ],
  LOG_EVENTOS: ["evento", "jogador", "id_fase", "metadata", "data"]
};

var SETTINGS = {
  SPREADSHEET_ID: "1C_ztniRGjTVhDkMtNomuD6ADZzBtHwAcwVF7dkU-Xt8"
};

var PROVISION = {
  ROOT_FOLDER_NAME: "game",
  PROJECT_FOLDER_NAME: "labirinto",
  SPREADSHEET_NAME: "Game EAC - Labirinto de Palavras"
};

function doGet(e) {
  try {
    ensureSheetsAndHeaders_();
    var action = (e && e.parameter && e.parameter.action) || "health";
    var payloadRaw = (e && e.parameter && e.parameter.payload) || "{}";
    var payload = safeParseJson_(payloadRaw, {});
    var data = routeAction_(action, payload);
    return jsonOutput_({ ok: true, data: data });
  } catch (error) {
    return jsonOutput_({ ok: false, error: getErrorMessage_(error) });
  }
}

function doPost(e) {
  try {
    ensureSheetsAndHeaders_();
    var body = safeParseJson_(e.postData && e.postData.contents, {});
    var action = body.action || "health";
    var payload = body.payload || {};
    var data = routeAction_(action, payload);
    return jsonOutput_({ ok: true, data: data });
  } catch (error) {
    return jsonOutput_({ ok: false, error: getErrorMessage_(error) });
  }
}

function setupSheets() {
  ensureSheetsAndHeaders_();
  return { ok: true, ready: true };
}

function seedDemoData() {
  ensureSheetsAndHeaders_();
  seedDemoData_();
  return { ok: true, seeded: true };
}

function healthCheck() {
  ensureSheetsAndHeaders_();
  return routeAction_("health", {});
}

function testGetConfig() {
  ensureSheetsAndHeaders_();
  return routeAction_("getConfig", {});
}

function testGetRanking() {
  ensureSheetsAndHeaders_();
  return routeAction_("getRanking", { limit: 10 });
}

function testGetPhase1() {
  ensureSheetsAndHeaders_();
  return routeAction_("getPhase", { phaseId: 1, wordOrder: 1 });
}

function setSpreadsheetId(spreadsheetId) {
  var id = String(spreadsheetId || "").trim();
  if (!id) {
    throw new Error("Informe um spreadsheetId valido.");
  }
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", id);
  var spreadsheet = SpreadsheetApp.openById(id);
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName()
  };
}

function setSpreadsheetIdFromSettings() {
  var id = String(SETTINGS.SPREADSHEET_ID || "").trim();
  if (!id) {
    throw new Error(
      "Preencha SETTINGS.SPREADSHEET_ID no topo do arquivo e execute novamente setSpreadsheetIdFromSettings."
    );
  }
  return setSpreadsheetId(id);
}

function setSpreadsheetIdFromActiveSheet() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) {
    throw new Error(
      "Nenhuma planilha ativa neste projeto. Abra o Apps Script dentro da planilha ou use setSpreadsheetIdFromSettings."
    );
  }
  return setSpreadsheetId(activeSpreadsheet.getId());
}

function clearSpreadsheetId() {
  PropertiesService.getScriptProperties().deleteProperty("SPREADSHEET_ID");
  return { ok: true, cleared: true };
}

function getSpreadsheetInfo() {
  var spreadsheet = getSpreadsheet_();
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
}

function provisionGameWorkspace() {
  var rootFolder = DriveApp.getRootFolder();
  var gameFolder = getOrCreateChildFolder_(rootFolder, PROVISION.ROOT_FOLDER_NAME);
  var labirintoFolder = getOrCreateChildFolder_(gameFolder, PROVISION.PROJECT_FOLDER_NAME);

  var spreadsheet = findSpreadsheetInFolderByName_(labirintoFolder, PROVISION.SPREADSHEET_NAME);
  var createdNow = false;
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create(PROVISION.SPREADSHEET_NAME);
    createdNow = true;
    moveFileToFolder_(spreadsheet.getId(), labirintoFolder);
  }

  setSpreadsheetId(spreadsheet.getId());
  ensureSheetsAndHeaders_();
  seedDemoData_();

  return {
    ok: true,
    createdNow: createdNow,
    folder: {
      gameName: gameFolder.getName(),
      gameId: gameFolder.getId(),
      labirintoName: labirintoFolder.getName(),
      labirintoId: labirintoFolder.getId()
    },
    spreadsheet: {
      id: spreadsheet.getId(),
      name: spreadsheet.getName(),
      url: spreadsheet.getUrl()
    },
    setup: {
      sheetsReady: true,
      demoDataSeeded: true
    }
  };
}

function routeAction_(action, payload) {
  switch (action) {
    case "health":
      return { status: "ok", mode: "apps_script" };
    case "setupSheets":
      ensureSheetsAndHeaders_();
      return { ready: true };
    case "seedDemoData":
      seedDemoData_();
      return { seeded: true };
    case "provisionWorkspace":
      return provisionGameWorkspace();
    case "getConfig":
      return { config: getConfig_() };
    case "registerPlayer":
      return registerPlayer_(payload);
    case "findPlayerByPhone":
      return findPlayerByPhone_(payload);
    case "getPlayerById":
      return getPlayerById_(payload);
    case "getPhase":
      return getPhase_(payload);
    case "submitResult":
      return submitResult_(payload);
    case "getRanking":
      return getRanking_(payload);
    case "logEvent":
      return logEvent_(payload);
    default:
      throw new Error("Acao nao suportada: " + action);
  }
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getOrCreateChildFolder_(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function findSpreadsheetInFolderByName_(folder, spreadsheetName) {
  var files = folder.getFilesByName(spreadsheetName);
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      return SpreadsheetApp.openById(file.getId());
    }
  }
  return null;
}

function moveFileToFolder_(fileId, targetFolder) {
  var file = DriveApp.getFileById(fileId);
  targetFolder.addFile(file);
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (error) {}
}

function getSpreadsheet_() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  var propertySpreadsheetId = PropertiesService.getScriptProperties().getProperty(
    "SPREADSHEET_ID"
  );
  var spreadsheetId = String(propertySpreadsheetId || SETTINGS.SPREADSHEET_ID || "").trim();
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  throw new Error(
    "Nenhuma planilha ativa encontrada. Se o projeto for standalone, configure o SPREADSHEET_ID em Script Properties ou execute setSpreadsheetId('SEU_ID')."
  );
}

function ensureSheetsAndHeaders_() {
  ensureSheet_(SHEETS.CONFIG, HEADERS.CONFIG);
  ensureSheet_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  ensureSheet_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);
  ensureSheet_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  ensureSheet_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  ensureSheet_(SHEETS.RANKING, HEADERS.RANKING);
  ensureSheet_(SHEETS.LOG_EVENTOS, HEADERS.LOG_EVENTOS);
  migrateLegacySchema_();
}

function ensureSheet_(name, headers) {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeaderFix = false;
  for (var i = 0; i < headers.length; i += 1) {
    if (String(currentHeaders[i] || "") !== headers[i]) {
      needsHeaderFix = true;
      break;
    }
  }
  if (needsHeaderFix) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function migrateLegacySchema_() {
  migrateLegacyPalavras_();
  migrateLegacyLabirintos_();
  migrateLegacyJogadores_();
  migrateLegacyResultados_();
}

function migrateLegacyPalavras_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.PALAVRAS);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  var width = Math.max(sheet.getLastColumn(), HEADERS.PALAVRAS.length);
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var normalized = [];
  var seen = {};

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var phaseId = Number(row[0] || 0);
    if (!phaseId) {
      continue;
    }
    var hasWordOrder = Number(row[1] || 0) > 0;
    var wordOrder = hasWordOrder ? Number(row[1]) : 1;
    var word = hasWordOrder ? row[2] : row[1];
    var message = hasWordOrder ? row[3] : row[2];
    var reflection = hasWordOrder ? row[4] : row[3];
    var key = String(phaseId) + "|" + String(wordOrder);
    if (seen[key]) {
      continue;
    }
    seen[key] = true;
    normalized.push({
      id_fase: phaseId,
      ordem_palavra: wordOrder,
      palavra_correta: normalizeWord_(word || ""),
      mensagem: String(message || ""),
      reflexao: String(reflection || "")
    });
  }

  overwriteSheetWithObjects_(SHEETS.PALAVRAS, HEADERS.PALAVRAS, normalized);
}

function migrateLegacyLabirintos_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.LABIRINTOS);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  var width = Math.max(sheet.getLastColumn(), HEADERS.LABIRINTOS.length);
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var normalized = [];
  var seen = {};

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var phaseId = Number(row[0] || 0);
    if (!phaseId) {
      continue;
    }
    var hasWordOrder = Number(row[1] || 0) > 0;
    var wordOrder = hasWordOrder ? Number(row[1]) : 1;
    var gridJson = hasWordOrder ? row[2] : row[1];
    var start = hasWordOrder ? row[3] : row[2];
    var end = hasWordOrder ? row[4] : row[3];
    var key = String(phaseId) + "|" + String(wordOrder);
    if (seen[key]) {
      continue;
    }
    seen[key] = true;
    normalized.push({
      id_fase: phaseId,
      ordem_palavra: wordOrder,
      grid_json: String(gridJson || "[]"),
      inicio: String(start || '{"row":0,"col":0}'),
      fim: String(end || '{"row":0,"col":0}')
    });
  }

  overwriteSheetWithObjects_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS, normalized);
}

function migrateLegacyJogadores_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.JOGADORES);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  var width = Math.max(sheet.getLastColumn(), HEADERS.JOGADORES.length);
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var normalized = [];

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var playerId = String(row[0] || "").trim();
    if (!playerId) {
      continue;
    }
    var hasCurrentWordColumn = Number(row[8] || 0) > 0;
    normalized.push({
      id_jogador: playerId,
      nome: String(row[1] || ""),
      apelido: String(row[2] || ""),
      telefone: normalizePhone_(row[3]),
      pontuacao_total: Number(row[4] || 0),
      tempo_total_segundos: Number(row[5] || 0),
      fases_concluidas: Number(row[6] || 0),
      fase_atual: Number(row[7] || 1),
      palavra_atual_fase: hasCurrentWordColumn ? Number(row[8]) : 1,
      data_criacao: hasCurrentWordColumn
        ? String(row[9] || new Date().toISOString())
        : String(row[8] || new Date().toISOString())
    });
  }

  overwriteSheetWithObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES, normalized);
}

function migrateLegacyResultados_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.RESULTADOS);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  var width = Math.max(sheet.getLastColumn(), HEADERS.RESULTADOS.length);
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var normalized = [];

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var playerId = String(row[0] || "").trim();
    var phaseId = Number(row[1] || 0);
    if (!playerId || !phaseId) {
      continue;
    }
    var hasWordOrder = Number(row[2] || 0) > 0;
    normalized.push({
      id_jogador: playerId,
      id_fase: phaseId,
      ordem_palavra: hasWordOrder ? Number(row[2]) : 1,
      palavra_formada: normalizeWord_(hasWordOrder ? row[3] : row[2]),
      palavra_correta: normalizeWord_(hasWordOrder ? row[4] : row[3]),
      acertou: Number(hasWordOrder ? row[5] : row[4]) === 1 ? 1 : 0,
      tentativas: Number(hasWordOrder ? row[6] : row[5]) || 1,
      tempo_segundos: Number(hasWordOrder ? row[7] : row[6]) || 0,
      pontuacao: Number(hasWordOrder ? row[8] : row[7]) || 0,
      data: String(hasWordOrder ? row[9] : row[8] || new Date().toISOString())
    });
  }

  overwriteSheetWithObjects_(SHEETS.RESULTADOS, HEADERS.RESULTADOS, normalized);
}

function getRowsAsObjects_(sheetName, headers) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i += 1) {
    var row = {};
    for (var j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function appendObjectRow_(sheetName, headers, objectData) {
  var row = [];
  for (var i = 0; i < headers.length; i += 1) {
    row.push(objectData[headers[i]] !== undefined ? objectData[headers[i]] : "");
  }
  getSpreadsheet_().getSheetByName(sheetName).appendRow(row);
}

function overwriteSheetWithObjects_(sheetName, headers, objects) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (!objects || objects.length === 0) {
    return;
  }

  var data = [];
  for (var i = 0; i < objects.length; i += 1) {
    var row = [];
    for (var j = 0; j < headers.length; j += 1) {
      row.push(objects[i][headers[j]] !== undefined ? objects[i][headers[j]] : "");
    }
    data.push(row);
  }
  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
}

function getConfig_() {
  var rows = getRowsAsObjects_(SHEETS.CONFIG, HEADERS.CONFIG);
  var config = {
    whatsappGroupLink: "https://chat.whatsapp.com/FZ4dFpFUco4FZgJLjWz7Ow",
    gamePublicLink: "https://webapplabirintoeac.vercel.app/",
    shareMessageTemplate:
      'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}',
    totalPhases: 20,
    wordsPerPhase: 5
  };

  for (var i = 0; i < rows.length; i += 1) {
    var key = String(rows[i].chave || "").trim();
    var value = String(rows[i].valor || "").trim();
    if (!key) {
      continue;
    }
    if (key === "whatsapp_group_link") {
      config.whatsappGroupLink = value;
    }
    if (key === "game_public_link") {
      config.gamePublicLink = value;
    }
    if (key === "share_message_template") {
      config.shareMessageTemplate = value;
    }
    if (key === "total_phases") {
      config.totalPhases = Number(value || "0") || config.totalPhases;
    }
    if (key === "words_per_phase") {
      config.wordsPerPhase = Number(value || "0") || config.wordsPerPhase;
    }
  }

  // Corrige placeholders antigos salvos em planilha.
  if (
    !String(config.whatsappGroupLink || "").trim() ||
    String(config.whatsappGroupLink).indexOf("SEU_GRUPO_AQUI") !== -1
  ) {
    config.whatsappGroupLink = "https://chat.whatsapp.com/FZ4dFpFUco4FZgJLjWz7Ow";
  }
  if (
    !String(config.gamePublicLink || "").trim() ||
    String(config.gamePublicLink).indexOf("SEU_LINK_DO_JOGO_AQUI") !== -1
  ) {
    config.gamePublicLink = "https://webapplabirintoeac.vercel.app/";
  }

  return config;
}

function registerPlayer_(payload) {
  var name = String(payload.name || "").trim();
  var nickname = String(payload.nickname || "").trim();
  var phone = normalizePhone_(payload.phone);
  if (!name) {
    throw new Error("Nome e obrigatorio.");
  }
  if (!nickname) {
    throw new Error("Apelido e obrigatorio.");
  }
  if (phone.length < 10 || phone.length > 13) {
    throw new Error("Telefone invalido. Use DDD + numero.");
  }

  var players = getRowsAsObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  for (var i = 0; i < players.length; i += 1) {
    if (normalizePhone_(players[i].telefone) === phone) {
      if (!Number(players[i].palavra_atual_fase || 0)) {
        players[i].palavra_atual_fase = 1;
        overwriteSheetWithObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES, players);
      }
      return { player: mapPlayer_(players[i]) };
    }
  }

  var playerId = "P" + Utilities.formatString("%04d", players.length + 1);
  var newRow = {
    id_jogador: playerId,
    nome: name,
    apelido: nickname,
    telefone: phone,
    pontuacao_total: 0,
    tempo_total_segundos: 0,
    fases_concluidas: 0,
    fase_atual: 1,
    palavra_atual_fase: 1,
    data_criacao: new Date().toISOString()
  };
  appendObjectRow_(SHEETS.JOGADORES, HEADERS.JOGADORES, newRow);
  return { player: mapPlayer_(newRow) };
}

function findPlayerByPhone_(payload) {
  var phone = normalizePhone_(payload.phone);
  var players = getRowsAsObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  for (var i = 0; i < players.length; i += 1) {
    if (normalizePhone_(players[i].telefone) === phone) {
      return { player: mapPlayer_(players[i]) };
    }
  }
  return { player: null };
}

function getPlayerById_(payload) {
  var playerId = String(payload.playerId || "").trim();
  var players = getRowsAsObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  for (var i = 0; i < players.length; i += 1) {
    if (String(players[i].id_jogador) === playerId) {
      return { player: mapPlayer_(players[i]) };
    }
  }
  return { player: null };
}

function assertPhaseUnlocked_(player, phaseId, wordOrder) {
  var currentPhase = Math.max(1, Number(player.currentPhase || 1));
  var currentWord = Math.max(1, Number(player.currentWordInPhase || 1));

  if (Number(phaseId) > currentPhase) {
    throw new Error(
      "Fase bloqueada. Conclua a fase " + currentPhase + " para liberar a fase " + phaseId + "."
    );
  }

  if (Number(phaseId) === currentPhase && Number(wordOrder) > currentWord) {
    throw new Error(
      "Palavra bloqueada. Conclua a palavra " + currentWord + " antes de avancar."
    );
  }
}

function getPhase_(payload) {
  var phaseId = Number(payload.phaseId || 0);
  var config = getConfig_();
  var requestedWordOrder = Number(payload.wordOrder || 1);
  var wordOrder = Math.max(1, Math.min(requestedWordOrder, config.wordsPerPhase));
  var playerId = String(payload.playerId || "").trim();

  if (playerId) {
    var player = getPlayerById_({ playerId: playerId }).player;
    if (!player) {
      throw new Error("Jogador nao encontrado.");
    }
    assertPhaseUnlocked_(player, phaseId, wordOrder);
  }

  var words = getRowsAsObjects_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  var mazes = getRowsAsObjects_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);

  var wordRow = null;
  for (var i = 0; i < words.length; i += 1) {
    if (
      Number(words[i].id_fase) === phaseId &&
      Number(words[i].ordem_palavra || 1) === wordOrder
    ) {
      wordRow = words[i];
      break;
    }
  }
  if (!wordRow) {
    throw new Error("Fase/palavra nao encontrada.");
  }

  var mazeRow = null;
  for (var j = 0; j < mazes.length; j += 1) {
    if (
      Number(mazes[j].id_fase) === phaseId &&
      Number(mazes[j].ordem_palavra || 1) === wordOrder
    ) {
      mazeRow = mazes[j];
      break;
    }
  }
  if (!mazeRow) {
    throw new Error(
      "Labirinto nao encontrado para fase " + phaseId + " palavra " + wordOrder + "."
    );
  }

  return {
    phase: {
      id: phaseId,
      wordOrder: wordOrder,
      wordsPerPhase: config.wordsPerPhase,
      word: normalizeWord_(wordRow.palavra_correta),
      message: String(wordRow.mensagem || ""),
      reflection: String(wordRow.reflexao || ""),
      grid: safeParseJson_(mazeRow.grid_json, []),
      start: safeParseJson_(mazeRow.inicio, { row: 0, col: 0 }),
      end: safeParseJson_(mazeRow.fim, { row: 0, col: 0 })
    },
    totalPhases: config.totalPhases,
    wordsPerPhase: config.wordsPerPhase
  };
}

function submitResult_(payload) {
  var playerId = String(payload.playerId || "");
  var phaseId = Number(payload.phaseId || 0);
  var playerData = getPlayerById_({ playerId: playerId }).player;
  if (!playerData) {
    throw new Error("Jogador nao encontrado.");
  }

  var config = getConfig_();
  var wordOrder = Number(payload.wordOrder || playerData.currentWordInPhase || 1);
  wordOrder = Math.max(1, Math.min(wordOrder, config.wordsPerPhase));
  assertPhaseUnlocked_(playerData, phaseId, wordOrder);

  var phaseResponse = getPhase_({ phaseId: phaseId, wordOrder: wordOrder, playerId: playerId });
  var phase = phaseResponse.phase;
  var wordFormed = normalizeWord_(payload.wordFormed || "");
  var attempts = Number(payload.attempts || 1);
  var timeSeconds = Number(payload.timeSeconds || 0);
  var markedCorrect = !!payload.correct;
  var isCorrect = markedCorrect && wordFormed === phase.word;
  var score = calculateScore_(isCorrect, attempts, timeSeconds);

  var alreadySolvedThisWord = hasPreviousCorrectResult_(playerId, phaseId, wordOrder);

  appendObjectRow_(SHEETS.RESULTADOS, HEADERS.RESULTADOS, {
    id_jogador: playerId,
    id_fase: phaseId,
    ordem_palavra: wordOrder,
    palavra_formada: wordFormed,
    palavra_correta: phase.word,
    acertou: isCorrect ? 1 : 0,
    tentativas: attempts,
    tempo_segundos: timeSeconds,
    pontuacao: score,
    data: new Date().toISOString()
  });

  var players = getRowsAsObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  var playerIndex = -1;
  for (var i = 0; i < players.length; i += 1) {
    if (String(players[i].id_jogador) === playerId) {
      playerIndex = i;
      break;
    }
  }
  if (playerIndex === -1) {
    throw new Error("Jogador nao encontrado para atualizacao.");
  }

  var phaseCompleted = false;
  if (isCorrect && !alreadySolvedThisWord) {
    players[playerIndex].pontuacao_total = Number(players[playerIndex].pontuacao_total || 0) + score;
    players[playerIndex].tempo_total_segundos =
      Number(players[playerIndex].tempo_total_segundos || 0) + timeSeconds;

    var playerPhase = Number(players[playerIndex].fase_atual || 1);
    var playerWord = Number(players[playerIndex].palavra_atual_fase || 1);
    if (phaseId === playerPhase && wordOrder === playerWord) {
      if (wordOrder >= config.wordsPerPhase) {
        players[playerIndex].fase_atual = playerPhase + 1;
        players[playerIndex].palavra_atual_fase = 1;
        phaseCompleted = true;
      } else {
        players[playerIndex].palavra_atual_fase = playerWord + 1;
      }
    }
  }

  players[playerIndex].fases_concluidas = getCompletedPhaseCount_(playerId, config.wordsPerPhase);
  overwriteSheetWithObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES, players);
  updateRankingSheet_();

  var refreshedPlayer = mapPlayer_(players[playerIndex]);
  var journeyCompleted = refreshedPlayer.currentPhase > config.totalPhases;
  var nextPhase = journeyCompleted ? config.totalPhases : refreshedPlayer.currentPhase;
  var nextWordOrder = journeyCompleted ? config.wordsPerPhase : refreshedPlayer.currentWordInPhase;

  return {
    result: {
      playerId: playerId,
      phaseId: phaseId,
      wordOrder: wordOrder,
      wordsPerPhase: config.wordsPerPhase,
      word: phase.word,
      wordFormed: wordFormed,
      message: phase.message,
      reflection: phase.reflection,
      correct: isCorrect,
      attempts: attempts,
      timeSeconds: timeSeconds,
      score: score,
      createdAt: new Date().toISOString()
    },
    player: refreshedPlayer,
    nextPhase: nextPhase,
    nextWordOrder: nextWordOrder,
    wordsPerPhase: config.wordsPerPhase,
    phaseCompleted: phaseCompleted,
    journeyCompleted: journeyCompleted
  };
}

function getRanking_(payload) {
  updateRankingSheet_();
  var limit = Number(payload.limit || 10);
  var rows = getRowsAsObjects_(SHEETS.RANKING, HEADERS.RANKING);
  var ranking = [];
  for (var i = 0; i < rows.length; i += 1) {
    if (limit > 0 && i >= limit) {
      break;
    }
    ranking.push({
      position: Number(rows[i].posicao),
      playerId: String(rows[i].id_jogador),
      name: String(rows[i].nome),
      nickname: String(rows[i].apelido),
      totalScore: Number(rows[i].pontuacao_total || 0),
      totalCompletedPhases: Number(rows[i].fases_concluidas || 0),
      totalTimeSeconds: Number(rows[i].tempo_total_segundos || 0)
    });
  }
  return { ranking: ranking };
}

function logEvent_(payload) {
  appendObjectRow_(SHEETS.LOG_EVENTOS, HEADERS.LOG_EVENTOS, {
    evento: String(payload.event || ""),
    jogador: String(payload.playerId || ""),
    id_fase: payload.phaseId !== undefined ? Number(payload.phaseId) : "",
    metadata: payload.metadata !== undefined ? String(payload.metadata) : "",
    data: new Date().toISOString()
  });
  return { logged: true };
}

function hasPreviousCorrectResult_(playerId, phaseId, wordOrder) {
  var results = getRowsAsObjects_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  for (var i = 0; i < results.length; i += 1) {
    var samePlayer = String(results[i].id_jogador) === String(playerId);
    var samePhase = Number(results[i].id_fase) === Number(phaseId);
    var sameWord = Number(results[i].ordem_palavra || 1) === Number(wordOrder || 1);
    var isCorrect = Number(results[i].acertou) === 1;
    if (samePlayer && samePhase && sameWord && isCorrect) {
      return true;
    }
  }
  return false;
}

function getCompletedPhaseCount_(playerId, wordsPerPhase) {
  var results = getRowsAsObjects_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  var byPhase = {};
  for (var i = 0; i < results.length; i += 1) {
    var samePlayer = String(results[i].id_jogador) === String(playerId);
    var isCorrect = Number(results[i].acertou) === 1;
    if (!samePlayer || !isCorrect) {
      continue;
    }
    var phaseKey = String(Number(results[i].id_fase) || 0);
    var wordOrder = Number(results[i].ordem_palavra || 1);
    if (!byPhase[phaseKey]) {
      byPhase[phaseKey] = {};
    }
    byPhase[phaseKey][String(wordOrder)] = true;
  }

  var count = 0;
  for (var phase in byPhase) {
    if (!byPhase.hasOwnProperty(phase)) {
      continue;
    }
    var solvedWords = 0;
    for (var index = 1; index <= Number(wordsPerPhase || 5); index += 1) {
      if (byPhase[phase][String(index)]) {
        solvedWords += 1;
      }
    }
    if (solvedWords >= Number(wordsPerPhase || 5)) {
      count += 1;
    }
  }
  return count;
}

function updateRankingSheet_() {
  var players = getRowsAsObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  players.sort(function (a, b) {
    var scoreDiff = Number(b.pontuacao_total || 0) - Number(a.pontuacao_total || 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    var phaseDiff = Number(b.fases_concluidas || 0) - Number(a.fases_concluidas || 0);
    if (phaseDiff !== 0) {
      return phaseDiff;
    }
    var timeDiff = Number(a.tempo_total_segundos || 0) - Number(b.tempo_total_segundos || 0);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return String(a.data_criacao || "").localeCompare(String(b.data_criacao || ""));
  });

  var rankingRows = [];
  for (var i = 0; i < players.length; i += 1) {
    rankingRows.push({
      posicao: i + 1,
      id_jogador: players[i].id_jogador,
      nome: players[i].nome,
      apelido: players[i].apelido,
      pontuacao_total: Number(players[i].pontuacao_total || 0),
      fases_concluidas: Number(players[i].fases_concluidas || 0),
      tempo_total_segundos: Number(players[i].tempo_total_segundos || 0)
    });
  }
  overwriteSheetWithObjects_(SHEETS.RANKING, HEADERS.RANKING, rankingRows);
}

function calculateScore_(correct, attempts, timeSeconds) {
  if (!correct) {
    return 0;
  }
  var base = 100;
  var timeBonus = Math.max(0, 50 - Math.floor(Number(timeSeconds || 0) / 2));
  var firstTryBonus = Number(attempts || 1) === 1 ? 25 : 0;
  var penalties = Math.max(0, Number(attempts || 1) - 1) * 10;
  return Math.max(0, base + timeBonus + firstTryBonus - penalties);
}

function mapPlayer_(row) {
  return {
    id: String(row.id_jogador || ""),
    name: String(row.nome || ""),
    nickname: String(row.apelido || ""),
    phone: normalizePhone_(row.telefone || ""),
    totalScore: Number(row.pontuacao_total || 0),
    totalTimeSeconds: Number(row.tempo_total_segundos || 0),
    totalCompletedPhases: Number(row.fases_concluidas || 0),
    currentPhase: Number(row.fase_atual || 1),
    currentWordInPhase: Number(row.palavra_atual_fase || 1),
    createdAt: String(row.data_criacao || new Date().toISOString())
  };
}

function seedDemoData_() {
  upsertConfigValue_(
    "whatsapp_group_link",
    "https://chat.whatsapp.com/FZ4dFpFUco4FZgJLjWz7Ow"
  );
  upsertConfigValue_("game_public_link", "https://webapplabirintoeac.vercel.app/");
  ensureConfigValueIfMissing_(
    "share_message_template",
    'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}'
  );

  var seedPhases = buildSeedPhases_();
  upsertConfigValue_("total_phases", "20");
  upsertConfigValue_("words_per_phase", "5");

  var existingWords = getRowsAsObjects_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  var existingMazes = getRowsAsObjects_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);
  var existingWordKeys = {};
  var existingMazeKeys = {};
  for (var i = 0; i < existingWords.length; i += 1) {
    existingWordKeys[
      String(existingWords[i].id_fase) + "|" + String(existingWords[i].ordem_palavra || 1)
    ] = true;
  }
  for (var j = 0; j < existingMazes.length; j += 1) {
    existingMazeKeys[
      String(existingMazes[j].id_fase) + "|" + String(existingMazes[j].ordem_palavra || 1)
    ] = true;
  }

  for (var k = 0; k < seedPhases.length; k += 1) {
    var phase = seedPhases[k];
    var key = String(phase.id) + "|" + String(phase.wordOrder);

    if (!existingWordKeys[key]) {
      appendObjectRow_(SHEETS.PALAVRAS, HEADERS.PALAVRAS, {
        id_fase: phase.id,
        ordem_palavra: phase.wordOrder,
        palavra_correta: phase.word,
        mensagem: phase.message,
        reflexao: phase.reflection
      });
    }

    if (!existingMazeKeys[key]) {
      appendObjectRow_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS, {
        id_fase: phase.id,
        ordem_palavra: phase.wordOrder,
        grid_json: JSON.stringify(phase.grid),
        inicio: JSON.stringify(phase.start),
        fim: JSON.stringify(phase.end)
      });
    }
  }
}

function ensureConfigValueIfMissing_(key, defaultValue) {
  var rows = getRowsAsObjects_(SHEETS.CONFIG, HEADERS.CONFIG);
  for (var i = 0; i < rows.length; i += 1) {
    if (String(rows[i].chave || "").trim() === key && String(rows[i].valor || "").trim()) {
      return;
    }
  }
  upsertConfigValue_(key, defaultValue);
}

function upsertConfigValue_(key, value) {
  var rows = getRowsAsObjects_(SHEETS.CONFIG, HEADERS.CONFIG);
  var found = false;
  for (var i = 0; i < rows.length; i += 1) {
    if (String(rows[i].chave || "").trim() === key) {
      rows[i].valor = value;
      found = true;
      break;
    }
  }
  if (!found) {
    rows.push({ chave: key, valor: value });
  }
  overwriteSheetWithObjects_(SHEETS.CONFIG, HEADERS.CONFIG, rows);
}

function buildSeedPhases_() {
  var themes = [
    {
      message: "Perdoar nao muda o passado, mas transforma o coracao.",
      reflection: "Quem voce pode perdoar hoje?",
      words: ["PERDAO", "AMOR", "MISSA", "SERVIR", "UNIDADE"]
    },
    {
      message: "A oracao sustenta cada decisao do dia.",
      reflection: "Qual horario fixo voce separa para rezar?",
      words: ["ORACAO", "MISSAO", "VERDADE", "ALEGRIA", "GRATIDAO"]
    },
    {
      message: "Confiar em Deus fortalece escolhas maduras.",
      reflection: "Qual decisao hoje precisa de mais confianca em Deus?",
      words: ["CONFIANCA", "HUMILDADE", "FIDELIDADE", "CARIDADE", "FORTALEZA"]
    },
    {
      message: "A comunhao cresce na constancia de atitudes simples.",
      reflection: "Que habito precisa virar disciplina na sua rotina?",
      words: ["COMUNHAO", "DISCIPLINA", "ESPERANCA", "TESTEMUNHO", "PACIENCIA"]
    },
    {
      message: "Dialogo e respeito constroem unidade verdadeira.",
      reflection: "Onde voce pode agir com mais bondade e escuta?",
      words: ["DIALOGO", "PARTILHA", "RESPEITO", "BONDADE", "JUSTICA"]
    },
    {
      message: "O acolhimento abre caminho para a misericordia.",
      reflection: "Quem precisa ser acolhido por voce nesta semana?",
      words: ["ACOLHIMENTO", "MISERICORDIA", "PERSEVERANCA", "DEVOCACAO", "SABEDORIA"]
    },
    {
      message: "Generosidade e obediencia revelam maturidade espiritual.",
      reflection: "Qual passo concreto de generosidade voce pode dar hoje?",
      words: ["GENEROSIDADE", "MANSIDAO", "PRUDENCIA", "OBEDIENCIA", "PUREZA"]
    },
    {
      message: "Integridade e fraternidade fortalecem qualquer comunidade.",
      reflection: "Como viver solidariedade no seu grupo?",
      words: ["INTEGRIDADE", "SOLIDARIEDADE", "FRATERNIDADE", "GRATUIDADE", "DISPONIBILIDADE"]
    },
    {
      message: "A conversao diaria renova o coracao para adorar melhor.",
      reflection: "O que Deus esta pedindo para voce renovar hoje?",
      words: ["CONVERSAO", "RENOVACAO", "ADORACAO", "UNCAO", "CONSAGRACAO"]
    },
    {
      message: "Compromisso e responsabilidade sustentam a missao.",
      reflection: "Qual compromisso voce precisa cumprir com mais firmeza?",
      words: ["CORDIALIDADE", "LEALDADE", "FRANQUEZA", "COMPROMISSO", "RESPONSABILIDADE"]
    },
    {
      message: "Evangelizar pede coerencia, constancia e vida interior.",
      reflection: "Seu jeito de viver confirma o que voce anuncia?",
      words: ["EVANGELIZACAO", "COERENCIA", "ESPIRITUALIDADE", "MATURIDADE", "CONSTANCIA"]
    },
    {
      message: "Reconciliar e transformar exige entrega e dedicacao.",
      reflection: "Qual relacao precisa de reconciliacao hoje?",
      words: ["RECONCILIACAO", "SANTIFICACAO", "TRANSFORMACAO", "DEDICACAO", "PROPOSITO"]
    },
    {
      message: "Discernimento e determinacao guiam decisoes desafiadoras.",
      reflection: "Como discernir melhor antes de agir?",
      words: ["DISCERNIMENTO", "CORRESPONSABILIDADE", "LONGANIMIDADE", "MAGNANIMIDADE", "DETERMINACAO"]
    },
    {
      message: "Compaixao e conviccao caminham juntas na vida crista.",
      reflection: "Onde voce precisa combinar firmeza com misericordia?",
      words: ["COMPAIXAO", "MISERICORDIOSO", "CONVICCAO", "PROXIMIDADE", "COMUNIDADE"]
    },
    {
      message: "Sensibilidade espiritual gera edificacao da comunidade.",
      reflection: "Qual atitude sua pode edificar mais pessoas?",
      words: ["INTENCIONALIDADE", "SENSIBILIDADE", "DISPONIBILIDADE", "FRATERNIZACAO", "EDIFICACAO"]
    },
    {
      message: "Autenticidade e transparencia tornam o testemunho confiavel.",
      reflection: "Em que area voce precisa ser mais transparente?",
      words: ["AUTENTICIDADE", "TRANSPARENCIA", "RESPONSABILIZACAO", "CONSCIENTIZACAO", "FORTIFICACAO"]
    },
    {
      message: "Discipulado maduro multiplica servico e compromisso.",
      reflection: "Como seu exemplo pode formar novos discipulos?",
      words: ["EVANGELIZADOR", "PERSEVERANTE", "MISERICORDIOSA", "COMPROMETIDO", "DISCIPULADO"]
    },
    {
      message: "Intercessao e reparacao curam caminhos e restauram vidas.",
      reflection: "Por quem voce pode interceder com mais constancia?",
      words: ["SEMEADURA", "RESTAURACAO", "REPARACAO", "INTERCESSAO", "APROFUNDAMENTO"]
    },
    {
      message: "Uma vida espiritual firme gera frutos em todas as areas.",
      reflection: "Qual fruto de maturidade Deus espera de voce agora?",
      words: ["FIDEDIGNIDADE", "CORRESPONDENCIA", "ESPIRITUALMENTE", "TRANSFIGURACAO", "MULTIPLICACAO"]
    },
    {
      message: "No nivel final, perseveranca e missao andam em plenitude.",
      reflection: "Que legado de fe voce quer deixar ao concluir a jornada?",
      words: ["IRREVOGABILIDADE", "INABALABILIDADE", "CORRESPONSABILIDADE", "TRANSUBSTANCIACAO", "EVANGELIZADORES"]
    }
  ];

  var phases = [];
  for (var phaseIndex = 0; phaseIndex < themes.length; phaseIndex += 1) {
    var theme = themes[phaseIndex];
    for (var wordIndex = 0; wordIndex < theme.words.length; wordIndex += 1) {
      phases.push(
        buildSeedPhase_(
          phaseIndex + 1,
          wordIndex + 1,
          theme.words[wordIndex],
          theme.message,
          theme.reflection
        )
      );
    }
  }
  return phases;
}

function buildSeedPhase_(phaseId, wordOrder, rawWord, message, reflection) {
  var word = normalizeWord_(rawWord);
  var size = getGridSizeForPhase_(phaseId);
  var path = buildSnakePath_(size, word.length);
  var rng = createSeededRandom_(phaseId * 997 + wordOrder * 97 + 13);
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  var grid = [];
  for (var row = 0; row < size; row += 1) {
    var rowLetters = [];
    for (var col = 0; col < size; col += 1) {
      rowLetters.push(alphabet.charAt(Math.floor(rng() * alphabet.length)));
    }
    grid.push(rowLetters);
  }

  for (var i = 0; i < path.length; i += 1) {
    var coord = path[i];
    grid[coord.row][coord.col] = word.charAt(i);
  }

  return {
    id: phaseId,
    wordOrder: wordOrder,
    wordsPerPhase: 5,
    word: word,
    message: message,
    reflection: reflection,
    grid: grid,
    start: path[0],
    end: path[path.length - 1]
  };
}

function getGridSizeForPhase_(phaseId) {
  if (phaseId <= 5) {
    return 4;
  }
  if (phaseId <= 12) {
    return 5;
  }
  return 6;
}

function buildSnakePath_(size, length) {
  var path = [];
  var leftToRight = true;

  for (var row = 0; row < size && path.length < length; row += 1) {
    if (leftToRight) {
      for (var col = 0; col < size && path.length < length; col += 1) {
        path.push({ row: row, col: col });
      }
    } else {
      for (var col2 = size - 1; col2 >= 0 && path.length < length; col2 -= 1) {
        path.push({ row: row, col: col2 });
      }
    }
    leftToRight = !leftToRight;
  }

  return path;
}

function createSeededRandom_(seed) {
  var current = seed >>> 0;
  return function () {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function normalizePhone_(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeWord_(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .trim();
}

function safeParseJson_(raw, fallback) {
  try {
    if (raw === undefined || raw === null || raw === "") {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function getErrorMessage_(error) {
  if (error && error.message) {
    return String(error.message);
  }
  return "Erro inesperado no Apps Script.";
}
