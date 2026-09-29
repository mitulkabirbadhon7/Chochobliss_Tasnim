export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1C140D", marginBottom: "0.5rem" }}>
        Chocobliss by Tasnim
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#634E3F", maxWidth: "600px", lineHeight: 1.6 }}>
        Artisanal, handcrafted single-origin luxury chocolates.
      </p>
    </main>
  );
}
