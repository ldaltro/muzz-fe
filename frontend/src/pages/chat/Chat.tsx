import Header from "@/pages/chat/_components/header/Header.tsx";
import { useState } from "react";
import ChatTab from "@/pages/chat/_components/chat-tab/ChatTab.tsx";
import ProfileTab from "@/pages/chat/_components/profile-tab/ProfileTab.tsx";
import Tabs from "@/components/tabs/Tabs.tsx";

type TabId = "chat" | "profile";

const tabs = [
  { id: "chat" as const, label: "Chat" },
  { id: "profile" as const, label: "Profile" },
] as const;

const Chat = () => {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
};

export default Chat;
