import React from 'react';
import logo from './logo.svg';
import './App.css';

import ReportForm from './components/ReportForm';

function App() {
  return (
    <div className="App">
      <ReportForm />
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
