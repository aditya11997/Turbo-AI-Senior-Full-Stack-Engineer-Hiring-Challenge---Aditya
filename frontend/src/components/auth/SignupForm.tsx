"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "../../styles/auth.module.css";
import { registerUser } from "../../lib/api";
import { storeTokens } from "../../lib/auth";

import PasswordField from "./PasswordField";
import TextField from "./TextField";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await registerUser(email, password);
      storeTokens(response.tokens.access, response.tokens.refresh);
      router.push(response.ui?.landing_route ?? "/notes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        className={styles.emailField}
      />
      <PasswordField
        label="Password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        className={styles.passwordField}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        Sign Up
      </button>
    </form>
  );
}
