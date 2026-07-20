import ChatWrapper from "@/components/ChatWrapper";

export const metadata = {
  title: "Chat - Sarathi",
  description: "Find government schemes you qualify for",
};

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col">
      <ChatWrapper />
    </main>
  );
}
