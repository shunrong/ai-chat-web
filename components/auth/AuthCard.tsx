import { ReactNode } from "react";

export default function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="card w-full max-w-xl p-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-500" />
        <div className="text-2xl font-semibold">deepseek</div>
      </div>
      <div className="mb-4 text-center text-sm text-gray-500">{title}</div>
      {children}
      {footer && (
        <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
      )}
    </div>
  );
}
