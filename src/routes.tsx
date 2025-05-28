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
import { TextNotesPage } from './pages/TextNotesPage';
import { TextNoteEditorPage } from './pages/TextNoteEditorPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
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
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/study',
        element: (
          <ProtectedRoute>
            <StudyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/schedule',
        element: (
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/schedule/new',
        element: (
          <ProtectedRoute>
            <ScheduleFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/schedule/edit/:id',
        element: (
          <ProtectedRoute>
            <ScheduleFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/contacts',
        element: (
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/voice-notes',
        element: (
          <ProtectedRoute>
            <VoiceNotesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/text-notes',
        element: (
          <ProtectedRoute>
            <TextNotesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/text-notes/edit/:id',
        element: (
          <ProtectedRoute>
            <TextNoteEditorPage />
          </ProtectedRoute>
        ),
      }
    ],
  },
]);

export default router; 