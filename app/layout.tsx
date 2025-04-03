import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./styles/main.css";
import Footer from "./components/layout/footer";

export const metadata: Metadata = {
  title: "Bitcoin Holdings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-mono bg-black text-textStandard relative antialiased`}
      >
        <ThemeProvider attribute="data-theme">
          <div className="h-[calc(100vh-54px)] flex justify-center items-center">
            <main className="h-full">{children}</main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
