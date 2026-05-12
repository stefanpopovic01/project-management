export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "12px",
      fontFamily: "sans-serif",
      textAlign: "center",
    }}>
      <h1 style={{
        fontSize: "80px",
        fontWeight: "700",
        margin: "0",
        color: "#d1d5db",
        lineHeight: "1",
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: "22px",
        fontWeight: "500",
        margin: "0",
        color: "#111827",
      }}>
        Page not found
      </h2>
      <p style={{
        fontSize: "15px",
        color: "#6b7280",
        margin: "0",
        maxWidth: "320px",
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" style={{
        marginTop: "12px",
        padding: "10px 24px",
        backgroundColor: "#111827",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
      }}>
        Go home
      </a>
    </div>
  );
}