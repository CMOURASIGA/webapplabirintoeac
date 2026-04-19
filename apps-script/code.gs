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
  PALAVRAS: ["id_fase", "palavra_correta", "mensagem", "reflexao"],
  LABIRINTOS: ["id_fase", "grid_json", "inicio", "fim"],
  JOGADORES: [
    "id_jogador",
    "nome",
    "apelido",
    "telefone",
    "pontuacao_total",
    "tempo_total_segundos",
    "fases_concluidas",
    "fase_atual",
    "data_criacao"
  ],
  RESULTADOS: [
    "id_jogador",
    "id_fase",
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

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheetsAndHeaders_() {
  ensureSheet_(SHEETS.CONFIG, HEADERS.CONFIG);
  ensureSheet_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  ensureSheet_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);
  ensureSheet_(SHEETS.JOGADORES, HEADERS.JOGADORES);
  ensureSheet_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  ensureSheet_(SHEETS.RANKING, HEADERS.RANKING);
  ensureSheet_(SHEETS.LOG_EVENTOS, HEADERS.LOG_EVENTOS);
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
    whatsappGroupLink: "https://chat.whatsapp.com/SEU_GRUPO_AQUI",
    gamePublicLink: "https://SEU_LINK_DO_JOGO_AQUI",
    shareMessageTemplate:
      'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}',
    totalPhases: 5
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

function getPhase_(payload) {
  var phaseId = Number(payload.phaseId || 0);
  var words = getRowsAsObjects_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  var mazes = getRowsAsObjects_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);
  var config = getConfig_();

  var wordRow = null;
  for (var i = 0; i < words.length; i += 1) {
    if (Number(words[i].id_fase) === phaseId) {
      wordRow = words[i];
      break;
    }
  }
  if (!wordRow) {
    throw new Error("Fase nao encontrada.");
  }

  var mazeRow = null;
  for (var j = 0; j < mazes.length; j += 1) {
    if (Number(mazes[j].id_fase) === phaseId) {
      mazeRow = mazes[j];
      break;
    }
  }
  if (!mazeRow) {
    throw new Error("Labirinto nao encontrado para fase " + phaseId + ".");
  }

  var phase = {
    id: phaseId,
    word: normalizeWord_(wordRow.palavra_correta),
    message: String(wordRow.mensagem || ""),
    reflection: String(wordRow.reflexao || ""),
    grid: safeParseJson_(mazeRow.grid_json, []),
    start: safeParseJson_(mazeRow.inicio, { row: 0, col: 0 }),
    end: safeParseJson_(mazeRow.fim, { row: 0, col: 0 })
  };

  return {
    phase: phase,
    totalPhases: config.totalPhases
  };
}

function submitResult_(payload) {
  var playerId = String(payload.playerId || "");
  var phaseId = Number(payload.phaseId || 0);
  var wordFormed = normalizeWord_(payload.wordFormed || "");
  var attempts = Number(payload.attempts || 1);
  var timeSeconds = Number(payload.timeSeconds || 0);
  var markedCorrect = !!payload.correct;

  var playerData = getPlayerById_({ playerId: playerId }).player;
  if (!playerData) {
    throw new Error("Jogador nao encontrado.");
  }

  var phaseResponse = getPhase_({ phaseId: phaseId });
  var phase = phaseResponse.phase;
  var isCorrect = markedCorrect && wordFormed === phase.word;
  var score = calculateScore_(isCorrect, attempts, timeSeconds);

  appendObjectRow_(SHEETS.RESULTADOS, HEADERS.RESULTADOS, {
    id_jogador: playerId,
    id_fase: phaseId,
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

  if (isCorrect && !hasPreviousCorrectResult_(playerId, phaseId)) {
    players[playerIndex].pontuacao_total = Number(players[playerIndex].pontuacao_total || 0) + score;
    players[playerIndex].tempo_total_segundos =
      Number(players[playerIndex].tempo_total_segundos || 0) + timeSeconds;
    if (phaseId >= Number(players[playerIndex].fase_atual || 1)) {
      players[playerIndex].fase_atual = phaseId + 1;
    }
  }

  players[playerIndex].fases_concluidas = getCompletedPhaseCount_(playerId);
  overwriteSheetWithObjects_(SHEETS.JOGADORES, HEADERS.JOGADORES, players);
  updateRankingSheet_();

  var refreshedPlayer = mapPlayer_(players[playerIndex]);
  var config = getConfig_();
  var journeyCompleted = refreshedPlayer.currentPhase > config.totalPhases;
  var nextPhase = journeyCompleted ? config.totalPhases : refreshedPlayer.currentPhase;

  return {
    result: {
      playerId: playerId,
      phaseId: phaseId,
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

function hasPreviousCorrectResult_(playerId, phaseId) {
  var results = getRowsAsObjects_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  var correctCount = 0;
  for (var i = 0; i < results.length; i += 1) {
    var samePlayer = String(results[i].id_jogador) === String(playerId);
    var samePhase = Number(results[i].id_fase) === Number(phaseId);
    var isCorrect = Number(results[i].acertou) === 1;
    if (samePlayer && samePhase && isCorrect) {
      correctCount += 1;
    }
  }
  return correctCount > 1;
}

function getCompletedPhaseCount_(playerId) {
  var results = getRowsAsObjects_(SHEETS.RESULTADOS, HEADERS.RESULTADOS);
  var seen = {};
  for (var i = 0; i < results.length; i += 1) {
    var samePlayer = String(results[i].id_jogador) === String(playerId);
    var isCorrect = Number(results[i].acertou) === 1;
    if (samePlayer && isCorrect) {
      seen[String(results[i].id_fase)] = true;
    }
  }
  var count = 0;
  for (var key in seen) {
    if (seen.hasOwnProperty(key)) {
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
    createdAt: String(row.data_criacao || new Date().toISOString())
  };
}

function seedDemoData_() {
  var configRows = getRowsAsObjects_(SHEETS.CONFIG, HEADERS.CONFIG);
  if (configRows.length === 0) {
    appendObjectRow_(SHEETS.CONFIG, HEADERS.CONFIG, {
      chave: "whatsapp_group_link",
      valor: "https://chat.whatsapp.com/SEU_GRUPO_AQUI"
    });
    appendObjectRow_(SHEETS.CONFIG, HEADERS.CONFIG, {
      chave: "game_public_link",
      valor: "https://SEU_LINK_DO_JOGO_AQUI"
    });
    appendObjectRow_(SHEETS.CONFIG, HEADERS.CONFIG, {
      chave: "share_message_template",
      valor:
        'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}'
    });
    appendObjectRow_(SHEETS.CONFIG, HEADERS.CONFIG, {
      chave: "total_phases",
      valor: "5"
    });
  }

  var wordsRows = getRowsAsObjects_(SHEETS.PALAVRAS, HEADERS.PALAVRAS);
  var mazeRows = getRowsAsObjects_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS);
  if (wordsRows.length > 0 || mazeRows.length > 0) {
    return;
  }

  var phases = [
    {
      id: 1,
      word: "PERDAO",
      message: "Perdoar nao muda o passado, mas muda o coracao.",
      reflection: "Existe alguem que voce precisa perdoar hoje?",
      grid: [
        ["P", "X", "M", "O"],
        ["E", "R", "D", "A"],
        ["B", "C", "A", "O"],
        ["F", "G", "H", "I"]
      ],
      start: { row: 0, col: 0 },
      end: { row: 2, col: 3 }
    },
    {
      id: 2,
      word: "AMOR",
      message: "Quem ama serve com alegria e constancia.",
      reflection: "Como voce pode demonstrar amor concreto esta semana?",
      grid: [
        ["A", "M", "X", "Y"],
        ["Q", "O", "R", "T"],
        ["L", "N", "V", "W"],
        ["S", "P", "U", "Z"]
      ],
      start: { row: 0, col: 0 },
      end: { row: 1, col: 2 }
    },
    {
      id: 3,
      word: "MISSA",
      message: "A missa fortalece a caminhada e a comunhao.",
      reflection: "Qual atitude pode melhorar sua participacao na missa?",
      grid: [
        ["M", "I", "X", "P"],
        ["Q", "S", "S", "T"],
        ["L", "N", "A", "R"],
        ["B", "C", "D", "E"]
      ],
      start: { row: 0, col: 0 },
      end: { row: 2, col: 2 }
    },
    {
      id: 4,
      word: "SERVIR",
      message: "Servir e escolher amar tambem quando custa.",
      reflection: "Onde voce pode servir com mais disponibilidade?",
      grid: [
        ["S", "E", "X", "Y"],
        ["Q", "R", "V", "T"],
        ["L", "N", "I", "R"],
        ["B", "C", "D", "E"]
      ],
      start: { row: 0, col: 0 },
      end: { row: 2, col: 3 }
    },
    {
      id: 5,
      word: "UNIDADE",
      message: "A unidade nasce quando todos assumem a mesma missao.",
      reflection: "Qual passo seu pode fortalecer a unidade do grupo?",
      grid: [
        ["U", "N", "X", "Y"],
        ["Q", "I", "D", "T"],
        ["L", "O", "A", "D"],
        ["B", "C", "F", "E"]
      ],
      start: { row: 0, col: 0 },
      end: { row: 3, col: 3 }
    }
  ];

  for (var i = 0; i < phases.length; i += 1) {
    appendObjectRow_(SHEETS.PALAVRAS, HEADERS.PALAVRAS, {
      id_fase: phases[i].id,
      palavra_correta: phases[i].word,
      mensagem: phases[i].message,
      reflexao: phases[i].reflection
    });
    appendObjectRow_(SHEETS.LABIRINTOS, HEADERS.LABIRINTOS, {
      id_fase: phases[i].id,
      grid_json: JSON.stringify(phases[i].grid),
      inicio: JSON.stringify(phases[i].start),
      fim: JSON.stringify(phases[i].end)
    });
  }
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
