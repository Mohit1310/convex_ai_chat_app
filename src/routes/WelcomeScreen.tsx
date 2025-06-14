import { Button } from '../components/ui/button';

export default function WelcomeScreen({
  handleNewChat,
}: {
  handleNewChat: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">AI</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to AI Chat
        </h2>
        <p className="text-gray-600 mb-6">
          Start a conversation with AI models. Choose from Google's Gemini and
          other powerful language models.
        </p>
        <Button onClick={handleNewChat}>Start New Chat</Button>
      </div>
    </div>
  );
}
