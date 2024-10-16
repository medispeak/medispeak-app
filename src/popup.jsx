import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './components/Popup/index.jsx';

import './index.css'

const root = document.getElementById("medispeak_popup")

createRoot(root).render(<Popup />);
