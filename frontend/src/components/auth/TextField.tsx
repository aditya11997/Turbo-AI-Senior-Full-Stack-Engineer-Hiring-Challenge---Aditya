import styles from "../../styles/auth.module.css";

type TextFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email";
  placeholder?: string;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} />
    </label>
  );
}
