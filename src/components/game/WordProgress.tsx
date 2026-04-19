import Card from "../common/Card";

interface WordProgressProps {
  targetWord: string;
  currentWord: string;
}

function buildMaskedWord(targetWord: string, currentWord: string): string {
  const targetLetters = targetWord.split("");
  const currentLetters = currentWord.split("");

  return targetLetters
    .map((letter, index) => {
      const selected = currentLetters[index];
      return selected ? selected : "_";
    })
    .join(" ");
}

export default function WordProgress({ targetWord, currentWord }: WordProgressProps): JSX.Element {
  return (
    <Card>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400">Palavra</p>
      <p className="mt-2 text-center text-2xl font-extrabold tracking-[0.28em] text-white">
        {buildMaskedWord(targetWord, currentWord)}
      </p>
    </Card>
  );
}
