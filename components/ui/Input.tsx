import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = { className?: string };

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & BaseProps
>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} {...props} className={`input ${className}`} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} {...props} className={`input ${className}`} />;
});
