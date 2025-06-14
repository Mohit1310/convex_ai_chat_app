import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("api-keys");
  const [apiKeyForm, setApiKeyForm] = useState({
    provider: "google",
    keyName: "",
    apiKey: "",
  });

  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);
  const saveApiKey = useAction(api.apiKeysActions.saveApiKeyAction);
  const deleteApiKey = useMutation(api.apiKeys.deleteApiKey);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyForm.keyName.trim() || !apiKeyForm.apiKey.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await saveApiKey({
        provider: apiKeyForm.provider,
        keyName: apiKeyForm.keyName.trim(),
        apiKey: apiKeyForm.apiKey.trim(),
      });
      setApiKeyForm({ provider: "google", keyName: "", apiKey: "" });
      toast.success("API key saved successfully");
    } catch (error) {
      toast.error("Failed to save API key");
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      try {
        await deleteApiKey({ keyId: keyId as any });
        toast.success("API key deleted");
      } catch (error) {
        toast.error("Failed to delete API key");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "api-keys"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Keys</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add your API keys to use different AI models. Your keys are encrypted and stored securely.
                </p>
              </div>

              {/* Add API Key Form */}
              <form onSubmit={handleSaveApiKey} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Add New API Key</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    value={apiKeyForm.provider}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="google">Google AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <Input
                    type="text"
                    value={apiKeyForm.keyName}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, keyName: e.target.value })}
                    placeholder="e.g., My Google AI Key"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKeyForm.apiKey}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                >
                  Save API Key
                </Button>
              </form>

              {/* Existing API Keys */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Your API Keys</h4>
                {apiKeys && apiKeys.length > 0 ? (
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div
                        key={key._id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{key.keyName}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {key.provider} • {key.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteApiKey(key._id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete API key"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No API keys added yet.</p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Getting Your Google AI API Key</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Create API Key"</li>
                  <li>Copy the generated key and paste it above</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your account information and preferences.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
