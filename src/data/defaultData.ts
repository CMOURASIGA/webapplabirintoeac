import type { GameConfig } from "../types/api";
import type { Coord, MazePhase } from "../types/game";

interface PhaseTheme {
  message: string;
  reflection: string;
  words: string[];
}

const phaseThemes: PhaseTheme[] = [
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

export const defaultConfig: GameConfig = {
  whatsappGroupLink: "https://chat.whatsapp.com/FZ4dFpFUco4FZgJLjWz7Ow",
  gamePublicLink: "https://webapplabirintoeac.vercel.app/",
  shareMessageTemplate:
    'Acabei de concluir uma fase do Game EAC e encontrei a palavra "{{word}}"!\n\nVem participar tambem.\n\nEntre no grupo:\n{{group_link}}\n\nJogue aqui:\n{{game_link}}',
  totalPhases: phaseThemes.length,
  wordsPerPhase: 5
};

function normalizeWord(word: string): string {
  return word.toUpperCase().replace(/\s+/g, "").trim();
}

function getGridSizeForPhase(phaseId: number): number {
  if (phaseId <= 5) {
    return 4;
  }
  if (phaseId <= 12) {
    return 5;
  }
  return 6;
}

function createRng(seed: number): () => number {
  let current = seed >>> 0;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function buildSnakePath(size: number, length: number): Coord[] {
  const path: Coord[] = [];
  let leftToRight = true;

  for (let row = 0; row < size && path.length < length; row += 1) {
    if (leftToRight) {
      for (let col = 0; col < size && path.length < length; col += 1) {
        path.push({ row, col });
      }
    } else {
      for (let col = size - 1; col >= 0 && path.length < length; col -= 1) {
        path.push({ row, col });
      }
    }
    leftToRight = !leftToRight;
  }

  return path;
}

function buildPhase(phaseId: number, wordOrder: number, theme: PhaseTheme, rawWord: string): MazePhase {
  const word = normalizeWord(rawWord);
  const size = getGridSizeForPhase(phaseId);
  const path = buildSnakePath(size, word.length);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rng = createRng(phaseId * 997 + wordOrder * 97 + 13);

  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => alphabet[Math.floor(rng() * alphabet.length)])
  );

  path.forEach((coord, index) => {
    grid[coord.row][coord.col] = word[index];
  });

  return {
    id: phaseId,
    wordOrder,
    wordsPerPhase: defaultConfig.wordsPerPhase,
    word,
    message: theme.message,
    reflection: theme.reflection,
    grid,
    start: path[0],
    end: path[path.length - 1]
  };
}

export const defaultPhases: MazePhase[] = phaseThemes.flatMap((theme, phaseIndex) =>
  theme.words.map((word, wordIndex) => buildPhase(phaseIndex + 1, wordIndex + 1, theme, word))
);
