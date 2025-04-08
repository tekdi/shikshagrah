import { createTheme } from '@mui/material/styles';
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      secondaryBackground: string;
      infoText: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      secondaryBackground?: string;
      infoText?: string;
    };
  }
}
const customPalette = {
  custom: {
    secondaryBackground: '#E9DDFF',
    // infoText: '#0A0A0A',
  },
};
// Define your theme
const theme = createTheme({
  palette: {
    ...customPalette,
    primary: {
      main: '#024F9D', // Example color
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#FEF7FF',
    },
    text: {
      primary: '#333',
      // secondary: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export default theme;
