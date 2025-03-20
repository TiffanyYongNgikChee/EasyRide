import BusTimetable from './components/BusTimetable';
import History from './components/history';
import Register from './components/register';
import Camera from './components/system_camera';
import UserMenu from './components/user_menu';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Register.css";
import "./css/timetable.css";
import Login from './components/login';

function App() {
  return (
    <Router>
      <Routes>
        {/* User Menu Route */}
        <Route path="/" element={<UserMenu />} />

        {/* Registration Page Route */}
        <Route path="/register" element={
          <div className="registration-page">
            <Register />
          </div>
        } />

        {/* Other Routes */}
        <Route path="/timetable" element={<BusTimetable />} />
        <Route path="/login" element={<Login />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
