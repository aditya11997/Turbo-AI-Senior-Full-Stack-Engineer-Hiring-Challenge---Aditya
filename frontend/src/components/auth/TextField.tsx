import styles from "../../styles/auth.module.css";

type TextFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  className
}: TextFieldProps) {
  return (
    <label className={`${styles.field} ${className || ""}`}>
      <span className={styles.srOnly}>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
