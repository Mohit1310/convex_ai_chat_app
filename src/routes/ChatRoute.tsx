// routes/ChatRoute.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Onboarding } from "../components/Onboarding";
import { ChatInterface } from "../components/ChatInterface";

export function ChatRoute() {
  const { chatid } = useParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const chats = useQuery(api.chats.listChats);

  if (!loggedInUser || !chats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showOnboarding || (!localStorage.getItem("onboarding-completed") && chats.length === 0)) {
    return (
      <Onboarding
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem("onboarding-completed", "true");
        }}
      />
    );
  }

  return (
    <ChatInterface
      chatId={chatid!}
      user={loggedInUser}
      onShowOnboarding={() => setShowOnboarding(true)}
    />
  );
}
