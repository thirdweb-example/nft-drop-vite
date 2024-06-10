import { MainComponent } from "./components/MainComponent";
import { getTheme } from "./utils/getTheme";

/**
 *
 * @returns URL Examples
 * https://your-app.com/?contract=0xabcdef...&clientId=...&chain=...&theme=system
 */
function App() {
  const theme = getTheme();
  window.document.documentElement.classList.add(theme);
  return <MainComponent />;
}

export default App;
