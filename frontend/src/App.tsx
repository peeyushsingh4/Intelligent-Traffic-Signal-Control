import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { DataPreprocessing } from './pages/DataPreprocessing';
import { ModelTrainingComparison } from './pages/ModelTrainingComparison';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { PredictionTryIt } from './pages/PredictionTryIt';
import { FeatureInsights } from './pages/FeatureInsights';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
        {/* Persistent SaaS Sidebar */}
        <Sidebar />

        {/* Primary Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/data" element={<DataPreprocessing />} />
              <Route path="/training" element={<ModelTrainingComparison />} />
              <Route path="/evaluation" element={<ModelEvaluation />} />
              <Route path="/predict" element={<PredictionTryIt />} />
              <Route path="/insights" element={<FeatureInsights />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
