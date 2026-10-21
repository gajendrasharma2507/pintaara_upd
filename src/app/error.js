"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error for debugging
    console.error("[Pintaara Error]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0E0B09",
      color: "#F5EDE4",
      fontFamily: "'Avenir Next', 'Montserrat', sans-serif",
      padding: "40px 20px",
      textAlign: "center",
    }}>
      <div style={{ marginBottom: "24px", fontSize: "32px", opacity: 0.4 }}>✦</div>
      <h1 style={{
        fontSize: "13px",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "#C9A961",
        marginBottom: "12px",
        fontWeight: 600,
      }}>
        PINTAARA
      </h1>
      <p style={{
        fontSize: "13px",
        color: "#A69D92",
        letterSpacing: "0.08em",
        maxWidth: "340px",
        lineHeight: 1.7,
        marginBottom: "32px",
      }}>
        Something went wrong loading this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "12px 32px",
          background: "linear-gradient(135deg, #C9A961 0%, #DFCA8E 50%, #C9A961 100%)",
          color: "#1C1814",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
