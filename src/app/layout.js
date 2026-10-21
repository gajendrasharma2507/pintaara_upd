// Google Fonts are kept as fallbacks only.
// Primary fonts are the local brand fonts declared in globals.css:
//   Baskerville-*.woff → --font-logo / --font-serif   (brand name, titles)
//   AvenirNext-*.ttf   → --font-sans                  (body, UI, labels)
//   Maves-Regular.ttf  → --font-accent                (Legacy statement lines)
import { Cinzel, Montserrat, Playfair_Display, Cormorant_Garamond, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import "@/styles/header.css";
import "@/styles/footer.css";
import "@/styles/product-pricing.css";
import "@/styles/collection-view.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import PasswordGate from "@/components/PasswordGate";

// Fallback: loaded only if the local font cannot render
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat-fallback",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-fallback",
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-baskerville",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Pintaara | Luxury Jewellery & Original Forms",
  description: "Others follow what already exists. Pintaara searches for forms that don't. Explore our premium collection of luxury jewellery and timeless original designs.",
  icons: {
    icon: "/images/logo-butterfly.png",
    shortcut: "/images/logo-butterfly.png",
    apple: "/images/logo-butterfly.png",
  },
  openGraph: {
    title: "Pintaara | Luxury Jewellery",
    description: "Explore our premium collection of luxury jewellery and timeless original designs.",
    type: "website",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${cinzel.variable} ${montserrat.variable} ${playfair.variable} ${cormorant.variable} ${baskerville.variable}`}>
        <AuthProvider>
          <CartProvider>
            <PasswordGate>
              {children}
            </PasswordGate>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
