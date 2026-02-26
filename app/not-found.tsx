import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-wrap">
      <h2 className="page-heading">Page Not Found</h2>
      <p className="page-subheading">The requested game or route does not exist.</p>
      <Link href="/" className="pill" style={{ marginTop: "0.9rem", display: "inline-block" }}>
        Back to Dashboard
      </Link>
    </main>
  );
}
