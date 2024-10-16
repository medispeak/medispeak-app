import React from 'react';
import { createRoot } from 'react-dom/client';
import Tab from './components/Tab/index.jsx';

import './index.css'

const root = document.getElementById("tab_root")

createRoot(root).render(<Tab />);
