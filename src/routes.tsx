import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { SchedulePage } from './pages/SchedulePage';
import { ScheduleFormPage } from './pages/ScheduleFormPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ContactsPage } from './pages/ContactsPage';
import { VoiceNotesPage } from './pages/VoiceNotesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/study',
        element: <StudyPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/schedule',
        element: <SchedulePage />,
      },
      {
        path: '/schedule/new',
        element: <ScheduleFormPage />,
      },
      {
        path: '/schedule/edit/:id',
        element: <ScheduleFormPage />,
      },
      {
        path: '/contacts',
        element: <ContactsPage />,
      },
      {
        path: '/voice-notes',
        element: <VoiceNotesPage />,
      }
    ],
  },
]);

export default router; 