import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "primary", ...props },
  ref
) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : "px-3 py-2 rounded-md hover:bg-gray-100";
  return <button ref={ref} {...props} className={`${base} ${className}`} />;
});
