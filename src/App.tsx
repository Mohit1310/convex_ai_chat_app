import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatInterface } from "./components/ChatInterface";
import { Onboarding } from "./components/Onboarding";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster position="top-right" />
    </div>
  );
}

function AuthenticatedApp() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const chats = useQuery(api.chats.listChats);

  if (loggedInUser === undefined || chats === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show onboarding for new users or when explicitly requested
  if (showOnboarding || (!localStorage.getItem('onboarding-completed') && chats.length === 0)) {
    return (
      <Onboarding 
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding-completed', 'true');
        }}
      />
    );
  }

  return (
    <ChatInterface 
      user={loggedInUser}
      onShowOnboarding={() => setShowOnboarding(true)}
    />
  );
}

function UnauthenticatedApp() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Chat</h1>
            <p className="text-gray-600">
              Chat with multiple AI models including Google's Gemini. 
              Sign in to sync your conversations across devices.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <SignInForm />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New here? Create an account to get started with AI conversations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
