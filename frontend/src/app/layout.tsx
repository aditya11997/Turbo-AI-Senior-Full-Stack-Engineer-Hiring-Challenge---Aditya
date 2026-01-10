import { Inria_Serif, Inter } from "next/font/google";

import "../styles/globals.css";
import "../styles/tokens.css";

const inria = Inria_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inria"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter"
});

export const metadata = {
  title: "Turbo AI Hiring Challenge",
  description: "Senior Full Stack Engineer Hiring Challenge",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inria.variable}`}>
        {children}
      </body>
    </html>
  );
}
