import styles from "../../styles/auth.module.css";

import PasswordField from "./PasswordField";
import TextField from "./TextField";

export default function SignupForm() {
  return (
    <form className={styles.form}>
      <TextField
        label="Full name"
        name="name"
        placeholder="Ada Lovelace"
      />
      <TextField
        label="Work email"
        name="email"
        type="email"
        placeholder="ada@turbo.ai"
      />
      <PasswordField
        label="Password"
        name="password"
        placeholder="At least 8 characters"
      />
      <button className={styles.submit} type="submit">
        Create account
      </button>
    </form>
  );
}
