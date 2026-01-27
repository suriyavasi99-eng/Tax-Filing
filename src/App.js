import { BrowserRouter , Router, Routes, Route, Navigate } from 'react-router-dom';
import SingupPages from './Pages/Singuppage';
import Loginpages from './Pages/Loginpage';
import DashboardPage from './Pages/Dashboardpage';
import Registrationpage from './Pages/Registrationpage';
import Efilereturnlistpage from './Pages/Efileretunrs';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace/>}/>
        <Route path="/login" element={<Loginpages />} />
        <Route path="/signup" element={<SingupPages/>}/>
        <Route path="/dashboard/:id" element={<DashboardPage />} />
        <Route path="/register" element={<Registrationpage/>}/>
        <Route path="/filer" element={<Efilereturnlistpage/>}/>
      </Routes>
    </BrowserRouter>

    </>
  );
}

export default App;
