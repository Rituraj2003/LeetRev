import { BrowserRouter, Routes,Route } from "react-router-dom";
import SideBar from './components/SideBar'
import Dashboard from './pages/Dashboard'
import Reviews from "./pages/Reviews";

function App() {
  return (
    <BrowserRouter>
      <div>
        <SideBar/>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;
