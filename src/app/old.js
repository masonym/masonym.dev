import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import SalesPic from '../assets/upcoming-sales.png'
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className={styles.App}>
      {/* <title>masonym's maple matrix</title>
      <meta name="og:description" content="hi its my website =)" /> */}
      <header className={styles.header}>
        <h1>nothing to see here, really</h1>
      </header>
      <main className={styles.main}>
        <section className={styles.aboutMe}>
          <h2>About Me</h2>
          <p>
            Hi there, this page is pretty empty for now. I'm Mason, sometimes known as masonym or Zakum on MapleStory =)
          </p>
        </section>
        <section className={styles.links}>
          <h2>Links</h2>
          <ul>
            <li><a href="https://www.youtube.com/channel/UCdSDc5DnBUS6bWJgPfwfYSA" target="_blank">YouTube</a></li>
          </ul>
        </section>
        <section className={styles.projects}>
          <h2>Tools</h2>
          <h4>Upcoming Cash Shop Sales</h4>
          <Link href="/cash-shop">
          <img src={SalesPic.src} alt="Cash shop sales site">
          </img>
          </Link>
          <p><i>A handy tool for checking the upcoming Cash Shop sales for MapleStory</i></p>

        </section>
      </main>
      <Footer/>
    </div>
  );
}