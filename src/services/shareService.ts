import type { GameConfig } from "../types/api";

interface ShareMessageInput {
  config: GameConfig;
  word?: string;
}

const FALLBACK_GROUP_LINK = "https://chat.whatsapp.com/FZ4dFpFUco4FZgJLjWz7Ow";
const FALLBACK_GAME_LINK = "https://webapplabirintoeac.vercel.app/";

function resolveGroupLink(rawLink: string): string {
  const value = String(rawLink || "").trim();
  if (!value || value.includes("SEU_GRUPO_AQUI")) {
    return FALLBACK_GROUP_LINK;
  }
  return value;
}

function resolveGameLink(rawLink: string): string {
  const value = String(rawLink || "").trim();
  if (!value || value.includes("SEU_LINK_DO_JOGO_AQUI")) {
    return FALLBACK_GAME_LINK;
  }
  return value;
}

export function buildShareMessage(input: ShareMessageInput): string {
  const fallbackWord = input.word ?? "UMA NOVA PALAVRA";
  const groupLink = resolveGroupLink(input.config.whatsappGroupLink);
  const gameLink = resolveGameLink(input.config.gamePublicLink);
  return input.config.shareMessageTemplate
    .replaceAll("{{word}}", fallbackWord)
    .replaceAll("{{group_link}}", groupLink)
    .replaceAll("{{game_link}}", gameLink);
}

export function buildWhatsAppShareUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}
