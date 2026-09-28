import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { DataProvider } from "@/components/providers/DataProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jadwaly",
  description: "Study planner for IB students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
