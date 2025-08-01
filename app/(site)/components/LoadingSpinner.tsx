import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline"; // loại nút
  children: React.ReactNode;
}

export default function Button({
  isLoading = false,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition";

  const variantStyles = {
    primary: "bg-black text-white hover:bg-white hover:text-black border border-black",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent border border-gray-500 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        (disabled || isLoading) && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
      )}
      {children}
    </button>
  );
}
