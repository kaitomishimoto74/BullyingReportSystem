import React from 'react';
import { createRoot } from 'react-dom/client';
import ReportForm from './ReportForm';

const root = createRoot(document.getElementById('react-report-root'));
root.render(<ReportForm />);