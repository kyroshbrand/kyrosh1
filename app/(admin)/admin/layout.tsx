"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050008" }}>
      {children}
    </div>
  );
}
