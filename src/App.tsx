import { Navigate, Route, Routes } from "react-router-dom";
import WelcomeScreen from "./screens/WelcomeScreen";
import PlayerRegisterScreen from "./screens/PlayerRegisterScreen";
import ContinueGameScreen from "./screens/ContinueGameScreen";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import RankingScreen from "./screens/RankingScreen";
import ShareScreen from "./screens/ShareScreen";
import FinalJourneyScreen from "./screens/FinalJourneyScreen";
import HelpScreen from "./screens/HelpScreen";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/register" element={<PlayerRegisterScreen />} />
      <Route path="/continue" element={<ContinueGameScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/game/:phaseId" element={<GameScreen />} />
      <Route path="/result" element={<ResultScreen />} />
      <Route path="/ranking" element={<RankingScreen />} />
      <Route path="/share" element={<ShareScreen />} />
      <Route path="/final" element={<FinalJourneyScreen />} />
      <Route path="/help" element={<HelpScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
