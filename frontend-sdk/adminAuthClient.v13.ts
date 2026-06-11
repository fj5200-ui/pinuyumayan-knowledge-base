export type AdminLoginInput = { email: string; password: string };

export class PinuyumayanAdminAuthClient {
  constructor(private readonly baseUrl: string) {}

  async login(input: AdminLoginInput) {
    const res = await fetch(`${this.baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
    return res.json();
  }

  async me() {
    const res = await fetch(`${this.baseUrl}/api/admin/auth/me`, { credentials: "include" });
    if (!res.ok) throw new Error(`Admin me failed: ${res.status}`);
    return res.json();
  }

  async changePassword(currentPassword: string, nextPassword: string) {
    const res = await fetch(`${this.baseUrl}/api/admin/auth/change-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, nextPassword })
    });
    if (!res.ok) throw new Error(`Password change failed: ${res.status}`);
    return res.json();
  }
}
