import { keyframes } from 'styled-components';
import slideInDown from 'react-animations/lib/slide-in-down';

export default {
  fontFamily: 'Signika',
  utils: {
    // the duration is passed as parameter
    slideInDown: duration => `animation: ${duration}s ${keyframes(slideInDown)};`,
  },
  colors: {
    buttons: {
      red: '#CC1022',
      blue: '#4E91E0',
      green: '#84D133',
      yellow: '#F7E638',
    },
  },
  lightTheme: {
    body: '#E2E2E2',
    text: '#363537',
    backgroundColor: '#FFF',
    toggleBorder: '#FFF',
    borderColor: '#363537',
    gradient: 'linear-gradient(#39598A, #79D7ED)',
  },
    darkTheme: {
    body: '#363537',
    backgroundColor: '#324157',
    text: '#fad715',
    toggleBorder: '#6B8096',
    borderColor: '#fad715',
    gradient: 'linear-gradient(#091236, #1E215D)',

  }
};
