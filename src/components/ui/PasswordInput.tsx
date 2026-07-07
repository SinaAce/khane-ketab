"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={cn("pe-11", className)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 end-3 flex items-center text-muted transition hover:text-foreground"
          aria-label={visible ? "مخفی کردن رمز" : "نمایش رمز"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
