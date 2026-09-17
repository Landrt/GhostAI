import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostAI — Your Voice. Your Ideas.",
  description: "SaaS de ghostwriting LinkedIn. Écris des posts qui te ressemblent vraiment, sans compromis ni tournures génériques.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-paper text-ink font-sans selection:bg-secondary-light selection:text-secondary">
        {children}
      </body>
    </html>
  );
}
