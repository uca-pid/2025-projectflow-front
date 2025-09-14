import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isAuthenticated } = useAuth();
  return <>{isAuthenticated ? <HomePage /> : <AuthPage />}</>;
}

export default App;
