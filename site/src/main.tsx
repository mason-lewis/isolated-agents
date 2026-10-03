import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import './effects.css';

const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode><Suspense fallback={<p className="loading" role="status">Loading the agents…</p>}><App /></Suspense></StrictMode>,
);
