import "./globals.css";
import { CurrencyProvider } from "@/src/contexts/CurrencyContext";

export const metadata = {
  title: "Amadeus",
  description: "Flight search application",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-w-0 overflow-x-hidden antialiased">
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
