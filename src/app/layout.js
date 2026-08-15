import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "VM Console",
  description: "Vulnerability Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
