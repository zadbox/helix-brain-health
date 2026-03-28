import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HELIX — Health Enhanced Language Intelligence",
  description: "Health Enhanced Language Intelligence — Système d'assistance médicale IA",
  icons: {
    icon: [{ url: "/BGEN-BLUE.jpeg", type: "image/jpeg" }],
    shortcut: "/BGEN-BLUE.jpeg",
    apple: "/BGEN-BLUE.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/BGEN-BLUE.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/BGEN-BLUE.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/BGEN-BLUE.jpeg" />
      </head>
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
