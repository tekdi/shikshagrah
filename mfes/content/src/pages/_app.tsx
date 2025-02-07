// import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@shikshav2.0/shared';
// import customTheme from '../theme/theme';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <ThemeProvider theme={customTheme}>
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
