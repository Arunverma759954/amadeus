import "./globals.css";
import { CurrencyProvider } from "@/src/contexts/CurrencyContext";

export const metadata = {
  title: "Amadeus",
  description: "Flight search application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
