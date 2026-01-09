import styles from "../../styles/auth.module.css";

type PasswordFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
};

export default function PasswordField({
  label,
  name,
  placeholder
}: PasswordFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input name={name} type="password" placeholder={placeholder} />
    </label>
  );
}
