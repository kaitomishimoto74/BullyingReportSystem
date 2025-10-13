import React from 'react';
import { createRoot } from 'react-dom/client';
import MainScreen from './MainScreen';

const root = createRoot(document.getElementById('react-root'));
root.render(<MainScreen />);