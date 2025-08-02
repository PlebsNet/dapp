import { Analytics } from '@vercel/analytics/react';
import { Providers } from "./providers";
import { Gabarito } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";
import { QueryClientProviderWrapper } from "@/components/QueryClientProviderWrapper"; 

const sans = Gabarito({
  variable: "--font-sans",
  subsets: ["latin-ext"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} antialiased bg-neutral-950 min-h-screen`}>
        <QueryClientProviderWrapper>
          <Providers>
            <Navigation />
            {/* Wrapper with left padding */}
            <div className="pl-26">
              {children}
            </div>
            <Footer />
            <Analytics />
          </Providers>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
