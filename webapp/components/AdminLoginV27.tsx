"use client";
import { useState } from "react";

export function AdminLoginV27({ apiBase = "" }: { apiBase?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function login() {
    setMessage("登入中...");
    const res = await fetch(`${apiBase}/api/admin/auth/v26/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return setMessage(data.error?.message ?? "登入失敗");
    localStorage.setItem("pinuyumayan_admin_token", data.data.token);
    setMessage(data.data.admin?.mustChangePassword ? "登入成功，請先更改密碼" : "登入成功");
  }
  return <section className="rounded-xl border p-4 space-y-3">
    <h2 className="text-lg font-semibold">後台登入 v27</h2>
    <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
    <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    <button className="rounded bg-black px-4 py-2 text-white" onClick={login}>登入</button>
    {message && <p className="text-sm">{message}</p>}
  </section>;
}
