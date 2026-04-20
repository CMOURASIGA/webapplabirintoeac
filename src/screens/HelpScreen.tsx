import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import Card from "../components/common/Card";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";

export default function HelpScreen(): JSX.Element {
  const navigate = useNavigate();

  return (
    <AppShell>
      <AppHeader title="Ajuda do jogo" showBack />
      <div className="flex flex-1 flex-col gap-4">
        <Card className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-200">Como jogar</p>
          <p className="text-sm text-slate-100">
            Comece na celula marcada como <strong>INICIO</strong>, caminhe apenas para celulas adjacentes
            (cima, baixo, esquerda, direita) e termine na celula <strong>FIM</strong> montando a palavra correta.
          </p>
          <p className="text-sm text-slate-100">
            Nao pode repetir celula. Algumas fases possuem armadilhas e limite de passos para aumentar o desafio.
          </p>
          <p className="text-sm text-slate-100">
            Cada fase tem <strong>5 palavras</strong>. Ao acertar a quinta palavra, voce avanca para a proxima fase.
          </p>
          <p className="text-sm text-slate-100">
            Regra de progressao: <strong>nao e permitido pular fase</strong>. A fase seguinte so libera quando a
            fase anterior for concluida por completo.
          </p>
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-200">Pontuacao</p>
          <p className="text-sm text-slate-100">Formula: 100 + bonusTempo + bonusPrimeiraTentativa - penalidades</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 px-2 py-2 text-slate-100">Acerto: +100</div>
            <div className="rounded-xl bg-white/10 px-2 py-2 text-slate-100">Tempo: ate +50</div>
            <div className="rounded-xl bg-white/10 px-2 py-2 text-slate-100">1a tentativa: +25</div>
            <div className="rounded-xl bg-white/10 px-2 py-2 text-slate-100">Erro/tentativa extra: -10</div>
          </div>
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-200">Ranking</p>
          <p className="text-sm text-slate-100">Ordem de classificacao:</p>
          <p className="text-sm text-slate-100">1) Maior pontuacao total</p>
          <p className="text-sm text-slate-100">2) Mais fases concluidas</p>
          <p className="text-sm text-slate-100">3) Menor tempo total</p>
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-200">Botoes de acao</p>
          <p className="text-sm text-slate-100">
            <strong>Reiniciar:</strong> reinicia a tentativa atual da fase.
          </p>
          <p className="text-sm text-slate-100">
            <strong>Voltar:</strong> retorna para a tela principal do jogador.
          </p>
          <p className="text-sm text-slate-100">
            <strong>Proxima fase:</strong> avanca para o proximo desafio apos acertar.
          </p>
          <p className="text-sm text-slate-100">
            <strong>Compartilhar:</strong> abre mensagem para divulgar no WhatsApp.
          </p>
          <p className="text-sm text-slate-100">
            <strong>Refletir depois:</strong> registra o evento e continua o fluxo.
          </p>
        </Card>

        <div className="space-y-3">
          <PrimaryButton label="Ir para o jogo" onClick={() => navigate("/home")} />
          <SecondaryButton label="Voltar ao inicio" onClick={() => navigate("/")} />
        </div>
      </div>
    </AppShell>
  );
}
