import React from 'react';
import styles from '../assets/HomePage.module.css';
import SalesPic from '../assets/upcoming-sales.png'
import { Helmet } from 'react-helmet';

function App() {
  return (
    <div className={styles.App}>
      <Helmet>
        <title>Home Page</title>
        <meta name="og:description" content="hi its my website =)" />
      </Helmet>
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
            <li><a href="https://www.youtube.com/channel/UCdSDc5DnBUS6bWJgPfwfYSA">YouTube</a></li>
          </ul>
        </section>
        <section className={styles.projects}>
          <h2>Tools</h2>
          <h4>Upcoming Cash Shop Sales</h4>
          <a href="/ms-upcoming-sales">
          <img src={SalesPic.src} alt="Upcoming sales site">
          </img>
          </a>
          <p><i>A handy tool for checking the upcoming Cash Shop sales for MapleStory</i></p>

        </section>
      </main>
    </div>
  );
}

export default App;