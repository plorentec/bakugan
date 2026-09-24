import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bakugan Battle Brawlers",
  description: "Build your deck and battle in the Bakugan world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
