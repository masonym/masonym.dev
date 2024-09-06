import "./globals.css";
import NavBar from "@/components/Navigation/NavBar/NavBar";
import Footer from "@/components/Footer";
import DynamicFavicon from "./components/DynamicFavicon";

export const metadata = {
  title: "mason's maple matrix",
  description: "A repository for the MapleStory tools I've written",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link id="favicon" rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen">
        <DynamicFavicon />
        <NavBar />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}