import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
