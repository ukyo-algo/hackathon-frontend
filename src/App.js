// hackathon-frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth_context';
import Homepage from './pages/homepage';
// ... 他のインポート
import AIChatWidget from './components/AIChatWidget'; // ★追加

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            {/* ... 他のルート ... */}
          </Routes>
          
          {/* ★ここに追加！全ページで右下に表示されます */}
          <AIChatWidget />
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;