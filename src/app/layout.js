import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/Navigation/NavBar/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "mason's maple matrix",
  description: "A repository for the MapleStory tools I've written",
  icons: {
    icon: ['/favicon.ico'],
    apple: ['/apple-touch-icon.png'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      {/* navbar goes here  */}
      <NavBar/>

      {children}
      </body>
    </html>
  );
}
