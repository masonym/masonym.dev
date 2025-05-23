import "./globals.css";
import NavBar from "@/components/Navigation/NavBar/NavBar";
import Footer from "@/components/Footer";
import DynamicFavicon from "./components/DynamicFavicon";
import Script from "next/script";

export const metadata = {
  title: "mason's maple matrix",
  description: "A repository for the MapleStory tools I've written",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link id="favicon" rel="icon" href="/favicon.ico" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BY50PB72SB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BY50PB72SB');
          `}
        </Script>
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