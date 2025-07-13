// App.tsx
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from './Landingpage/Landing';
import About from './Pagess/About';
import Details from './Pagess/Details';
import Login from './Pagess/Login';
import NewChit from './Pagess/NewChit';
import Addmember from './Pagess/Addmember';
import { UserProvider } from './Pagess/UserContext';
import ProtectedRoute from './Pagess/ProtectedRoute';
import SessionManager from './Pagess/SessionManager'; // ✅ import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <UserProvider>
      <SessionManager /> {/* ✅ Add globally */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/About" element={<About />} />
        <Route path="/Login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/Details" element={<ProtectedRoute><Details /></ProtectedRoute>} />
        <Route path="/NewChit" element={<ProtectedRoute><NewChit /></ProtectedRoute>} />
        <Route path="/Add" element={<ProtectedRoute><Addmember /></ProtectedRoute>} />

        <Route path="*" element={<p>Page Not Found</p>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </UserProvider>
  );
}

export default App;
