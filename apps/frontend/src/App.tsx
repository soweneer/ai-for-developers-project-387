import { Route, Routes } from 'react-router-dom';
import RoleSelectPage from './pages/RoleSelectPage';
import OwnerPage from './pages/OwnerPage';
import EventTypesPage from './pages/EventTypesPage';
import GuestPage from './pages/GuestPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/owner" element={<OwnerPage />} />
      <Route path="/owner/event-types" element={<EventTypesPage />} />
      <Route path="/guest" element={<GuestPage />} />
    </Routes>
  );
}

export default App;
