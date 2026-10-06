import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={clsx(styles.button, className)} {...props} />;
}
