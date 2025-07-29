import type { MouseEventHandler, ReactNode } from "react";

interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const Button = ({ 
  onClick, 
  children, 
  type = "button", 
  disabled = false, 
  className = "",
  ariaLabel 
}: ButtonProps) => {
  const baseClasses = "border-0 rounded-lg bg-[#e8506e] text-white px-2.5 py-1.5 font-semibold cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[#cc3d59]";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:bg-[#e8506e]" : "";
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${disabledClasses} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
