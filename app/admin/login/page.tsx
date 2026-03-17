import { adminPasswordConfigured } from "@/lib/admin-auth";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pick(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = pick(params.error);
  const message = pick(params.message);
  const configured = adminPasswordConfigured();

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">Admin Login</h2>
        <p className="page-subheading">Use your admin password to access the control panel.</p>
      </section>

      {!configured && (
        <div className="error-box">
          ADMIN_PASSWORD is not configured in this deployment. Add it in Vercel environment variables.
        </div>
      )}

      {error && <div className="error-box">{error}</div>}
      {message && <div className="card">{message}</div>}

      <section style={{ marginTop: "1rem", maxWidth: 420 }}>
        <form method="POST" action="/admin/auth/login" className="card form-stack">
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
