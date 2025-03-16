import Ticket from './components/buy_ticket';
import History from './components/history';
import Register from './components/register';
import Camera from './components/system_camera';
import UserMenu from './components/user_menu';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserMenu />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
    
  );
}

export default App;
