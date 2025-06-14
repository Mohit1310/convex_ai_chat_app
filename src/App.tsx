import { Routes, Route, Navigate } from 'react-router-dom';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInForm } from './SignInForm';
import { Toaster } from 'sonner';
import { ChatRoute } from './routes/ChatRoute';
import UnauthenticatedApp from './components/UnauthenticatedApp';
import Home from './routes/home';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <Authenticated>
              <Navigate to="/chat" />
            </Authenticated>
          }
        />

        <Route
          path="/chat"
          element={
            <Authenticated>
              <Home />
            </Authenticated>
          }
        />

        <Route
          path="/chat/:chatid"
          element={
            <Authenticated>
              <ChatRoute />
            </Authenticated>
          }
        />

        <Route
          path="*"
          element={
            <Unauthenticated>
              <UnauthenticatedApp />
            </Unauthenticated>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}
