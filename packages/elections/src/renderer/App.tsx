import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.global.css';
import './Reset.module.scss';
import { LayoutProvider } from './context/layout';
import LoaderScreen from './screens/Loader';
import {
  SimuladorPage,
  HomePage,
  NullBoxesPage,
  ExposedPage,
  NulledVotesPage,
  AboutPage,
} from './screens';
import Navigation from './components/Navigation';
import SmartPage from './features/SmartPage';
import Bar from './components/Bar';

export default function App() {
  return (
    <LayoutProvider>
      <Router>
        <Bar />
        <Navigation />
        <SmartPage>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/simulador/:type" element={<SimuladorPage />} />
            <Route path="/urnas-anuladas" element={<NullBoxesPage />} />
            <Route path="/sigilo-quebrado" element={<ExposedPage />} />
            <Route path="/votos-excluidos" element={<NulledVotesPage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>
        </SmartPage>
        <LoaderScreen />
      </Router>
    </LayoutProvider>
  );
}
