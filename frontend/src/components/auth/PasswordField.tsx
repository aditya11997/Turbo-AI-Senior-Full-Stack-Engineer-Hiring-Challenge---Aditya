"use client";

import React from "react";

import styles from "../../styles/auth.module.css";

type PasswordFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function PasswordField({
  label,
  name,
  placeholder,
  value,
  onChange,
  className
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <label className={`${styles.field} ${className || ""}`}>
      <span className={styles.srOnly}>{label}</span>
      <div className={styles.inputWrapper}>
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className={styles.visibilityToggle}
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          <span className={styles.visibilityIcon} aria-hidden="true" />
        </button>
      </div>
    </label>
  );
}
