import "../styles/globals.css";
import "../styles/tokens.css";

export const metadata = {
  title: "Turbo AI Hiring Challenge",
  description: "Senior Full Stack Engineer Hiring Challenge"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
