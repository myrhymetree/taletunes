import React from 'react';
import Landing from '../src/pages/landing/Landing'
import Library from '../src/pages/library/Library'
import Upload from '../src/pages/audiobook/Upload'
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="library" element={<Library />} />
        <Route path="audiobook" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
