import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: "700", variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Sarathi - Find Your Government Schemes",
  description: "AI-powered tool to find Indian government schemes you qualify for, instantly.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23FF5A00'/><text y='.9em' font-size='70' x='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,sans-serif' font-weight='900' fill='white'>S</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
