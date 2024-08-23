import "./globals.css";
import NavBar from "@/components/Navigation/NavBar/NavBar";
import Footer from "@/components/Footer";

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
      <body>
        {/* navbar goes here  */}
        <NavBar />

        {children}
        <Footer />
      </body>
    </html>
  );
}
