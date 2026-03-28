import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./chatbot.css";
import { Cursor, Grain, MainWrapper } from "@/components/GlobalUI";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatBot from "@/components/ChatBot";


const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400", "600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "700"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Kyrosh — Digital Marketing Agency",
  description: "We Don't Just Market. We Move People.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased selection:bg-primary selection:text-white">
        <Grain />
        <Cursor />
        <Navbar />
        <MainWrapper>{children}</MainWrapper>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}