import React, { useState, useMemo } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Book from './components/Book';
import './App.css';

function App() {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#5c6bc0',
      },
      secondary: {
        main: '#8c9eff',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#e0e0e0',
        secondary: mode === 'light' ? '#555555' : '#b0b0b0',
      },
    },
    typography: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Book onToggleTheme={toggleColorMode} currentTheme={mode} />
    </ThemeProvider>
  );
}

export default App;
