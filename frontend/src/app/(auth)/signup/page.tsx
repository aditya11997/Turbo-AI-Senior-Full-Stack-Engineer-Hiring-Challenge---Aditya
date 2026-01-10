import styles from "../../../styles/auth.module.css";

import SignupForm from "../../../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <img
          className={styles.catImage}
          src="/assets/cat.png"
          alt="Turbo AI cat"
          width={188.14}
          height={134}
        />
        <h1 className={styles.title}>Yay, New Friend!</h1>
        <SignupForm />
        <a className={styles.link} href="/login">
          We&apos;re already friends!
        </a>
      </section>
    </main>
  );
}
