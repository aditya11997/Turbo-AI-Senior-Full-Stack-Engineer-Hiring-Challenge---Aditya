"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./login.module.css";
import { storeTokens } from "../../../lib/auth";
import { api, AuthResponse } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password
      });
      storeTokens(response.tokens.access, response.tokens.refresh);
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <Image
          src="/assets/cactus.png"
          alt=""
          width={95}
          height={113}
          priority
        />
        <h1 className={styles.title}>Yay, You&apos;re Back!</h1>

        <div className={styles.fields}>
          <div className={styles.field}>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <input
              className={`${styles.input} ${styles.passwordInput}`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              <span className={styles.eyeIcon} />
            </button>
          </div>
        </div>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          Login
        </button>

        <div className={styles.error}>{error ?? ""}</div>

        <button
          type="button"
          className={styles.helper}
          onClick={() => router.push("/signup")}
        >
          Oops! I&apos;ve never been here before
        </button>
      </form>
    </div>
  );
}
