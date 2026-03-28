"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{adminGlobalStyle}</style>
      <div style={styles.card}>
        <div style={styles.logoCircle}>K</div>
        <h1 style={styles.title}>Kyrosh Admin</h1>
        <p style={styles.subtitle}>Sign in to manage chats</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const adminGlobalStyle = `
  body { margin: 0; background: #050008; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  * { box-sizing: border-box; cursor: auto !important; }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #050008 0%, #0a0515 50%, #050008 100%)",
    padding: 20,
  },
  card: {
    width: 380,
    maxWidth: "100%",
    padding: "40px 32px",
    borderRadius: 20,
    background: "rgba(10, 10, 14, 0.92)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(119, 64, 217, 0.25)",
    boxShadow: "0 16px 64px rgba(0,0,0,0.5)",
    textAlign: "center" as const,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7740d9, #d33bd7)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
  },
  subtitle: {
    margin: "6px 0 24px",
    fontSize: 14,
    color: "#888899",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  input: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(119, 64, 217, 0.25)",
    background: "rgba(15, 15, 20, 0.8)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: "#f87171",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #7740d9, #d33bd7)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
