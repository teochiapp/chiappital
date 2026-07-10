import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Unbounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }

  html {
    font-family: 'Unbounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Unbounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #ffffff;
    color: #2c3e50;
    font-weight: 400;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Unbounded', sans-serif;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0.5em;
  }

  p, span, div, a, li, td, th, label, input, textarea, select, button {
    font-family: 'Unbounded', sans-serif;
  }

  input, textarea, select, button {
    font-family: 'Unbounded', sans-serif;
    font-size: inherit;
  }

  code {
    font-family: 'Fira Code', 'JetBrains Mono', source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Unbounded', sans-serif;
  }

  /* Asegurar que React Router y otros elementos usen la fuente */
  .App {
    font-family: 'Unbounded', sans-serif;
    flex: 1;
  }

  /* Estilos para mejorar la legibilidad de Unbounded */
  .unbounded-light {
    font-weight: 300;
  }

  .unbounded-regular {
    font-weight: 400;
  }

  .unbounded-medium {
    font-weight: 500;
  }

  .unbounded-semibold {
    font-weight: 600;
  }

  .unbounded-bold {
    font-weight: 700;
  }

  .unbounded-extrabold {
    font-weight: 800;
  }
`;
