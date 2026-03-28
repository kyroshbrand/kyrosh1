import { Cursor, Grain, MainWrapper } from "@/components/GlobalUI";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import "../chatbot.css";
import { AuthProvider } from "@/context/AuthContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Grain />
      <Cursor />
      <Navbar />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <ChatBot />
    </AuthProvider>
  );
}
