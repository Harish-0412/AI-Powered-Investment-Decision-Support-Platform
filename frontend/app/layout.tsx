import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Intelligence",
  description: "Real-time stock data, portfolio tracking, and investment research tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
