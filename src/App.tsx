import AuthInitializer from "./components/auth/AuthInitializer";
import { Provider } from "./Provider";
import AppRouter from "./routes";

function App() {
  return (
    <Provider>
      <AuthInitializer />
      <AppRouter />
    </Provider>
  );
}

export default App;
