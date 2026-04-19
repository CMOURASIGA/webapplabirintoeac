import type { GameConfig } from "../types/api";
import type { MazePhase } from "../types/game";

export const defaultConfig: GameConfig = {
  whatsappGroupLink: "https://chat.whatsapp.com/SEU_GRUPO_AQUI",
  gamePublicLink: "https://SEU_LINK_DO_JOGO_AQUI",
  shareMessageTemplate:
    'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}',
  totalPhases: 5
};

export const defaultPhases: MazePhase[] = [
  {
    id: 1,
    word: "PERDAO",
    message: "Perdoar nao muda o passado, mas muda o coracao.",
    reflection: "Existe alguem que voce precisa perdoar hoje?",
    start: { row: 0, col: 0 },
    end: { row: 2, col: 3 },
    grid: [
      ["P", "X", "M", "O"],
      ["E", "R", "D", "A"],
      ["B", "C", "A", "O"],
      ["F", "G", "H", "I"]
    ]
  },
  {
    id: 2,
    word: "AMOR",
    message: "Quem ama serve com alegria e constancia.",
    reflection: "Como voce pode demonstrar amor concreto esta semana?",
    start: { row: 0, col: 0 },
    end: { row: 1, col: 2 },
    grid: [
      ["A", "M", "X", "Y"],
      ["Q", "O", "R", "T"],
      ["L", "N", "V", "W"],
      ["S", "P", "U", "Z"]
    ]
  },
  {
    id: 3,
    word: "MISSA",
    message: "A missa fortalece a caminhada e a comunhao.",
    reflection: "Qual atitude pode melhorar sua participacao na missa?",
    start: { row: 0, col: 0 },
    end: { row: 2, col: 2 },
    grid: [
      ["M", "I", "X", "P"],
      ["Q", "S", "S", "T"],
      ["L", "N", "A", "R"],
      ["B", "C", "D", "E"]
    ]
  },
  {
    id: 4,
    word: "SERVIR",
    message: "Servir e escolher amar tambem quando custa.",
    reflection: "Onde voce pode servir com mais disponibilidade?",
    start: { row: 0, col: 0 },
    end: { row: 2, col: 3 },
    grid: [
      ["S", "E", "X", "Y"],
      ["Q", "R", "V", "T"],
      ["L", "N", "I", "R"],
      ["B", "C", "D", "E"]
    ]
  },
  {
    id: 5,
    word: "UNIDADE",
    message: "A unidade nasce quando todos assumem a mesma missao.",
    reflection: "Qual passo seu pode fortalecer a unidade do grupo?",
    start: { row: 0, col: 0 },
    end: { row: 3, col: 3 },
    grid: [
      ["U", "N", "X", "Y"],
      ["Q", "I", "D", "T"],
      ["L", "O", "A", "D"],
      ["B", "C", "F", "E"]
    ]
  }
];
