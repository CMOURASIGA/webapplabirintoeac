import type { GameConfig } from "../types/api";

interface ShareMessageInput {
  config: GameConfig;
  word?: string;
}

export function buildShareMessage(input: ShareMessageInput): string {
  const fallbackWord = input.word ?? "UMA NOVA PALAVRA";
  return input.config.shareMessageTemplate
    .replaceAll("{{word}}", fallbackWord)
    .replaceAll("{{group_link}}", input.config.whatsappGroupLink)
    .replaceAll("{{game_link}}", input.config.gamePublicLink);
}

export function buildWhatsAppShareUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}
