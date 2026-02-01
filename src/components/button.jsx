import React from "react";

export const Button = ({ children, onClick, type = "button", variant = "primary", disabled, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;