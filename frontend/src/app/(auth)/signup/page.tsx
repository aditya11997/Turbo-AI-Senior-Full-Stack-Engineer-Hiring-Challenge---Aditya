import styles from "../../styles/auth.module.css";

import SignupForm from "../../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Start your Turbo AI trial</h1>
        <p className={styles.subtitle}>Create your account to continue.</p>
        <SignupForm />
      </section>
    </main>
  );
}
