import React, { useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Reader from './Reader';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    let theme = createTheme({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 768,
          lg: 1024,
          xl: 1536,
        },
      },
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
      },
    });

    return createTheme(theme, {
      typography: {
        body1: {
          [theme.breakpoints.down('md')]: {
            fontSize: '16px',
          },
        },
        h6: {
          [theme.breakpoints.down('md')]: {
            fontSize: '1.15rem',
          },
        },
      },
    });
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Reader />
    </ThemeProvider>
  );
}
