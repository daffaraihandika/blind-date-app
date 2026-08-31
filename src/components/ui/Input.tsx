"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      isPassword = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={generatedId}
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-zinc-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={generatedId}
            type={inputType}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              "w-full h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 px-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all duration-200 disabled:opacity-50 disabled:bg-zinc-100",
              leftIcon ? "pl-11" : "pl-4",
              isPassword ? "pr-12" : "pr-4",
              error && "border-red-500 focus:ring-red-500/40 focus:border-red-500 bg-red-50/20",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-500 font-medium ml-1 animate-fadeIn">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-400 ml-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
