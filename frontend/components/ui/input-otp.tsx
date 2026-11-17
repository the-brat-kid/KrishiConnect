"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { Minus } from "lucide-react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "gap-2 sm:gap-3 flex items-center justify-center has-disabled:opacity-50 select-none",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/80 backdrop-blur-md shadow-inner",
        className
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-12 w-10 sm:h-13 sm:w-11 items-center justify-center border-r last:border-r-0 border-zinc-200/80 dark:border-zinc-800/80 text-lg font-bold font-mono transition-all duration-150 outline-none text-foreground",
        "bg-white/70 dark:bg-zinc-900/70",
        "data-[active=true]:bg-emerald-500/10 dark:data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-600 dark:data-[active=true]:text-emerald-400 data-[active=true]:ring-2 data-[active=true]:ring-emerald-500/60 data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-emerald-500 h-5 w-[2px] rounded-full duration-1000 shadow-[0_0_8px_#10b981]" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center justify-center text-zinc-400 dark:text-zinc-600 px-0.5 sm:px-1"
      role="separator"
      {...props}
    >
      <Minus className="w-4 h-4" strokeWidth={2.5} />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, REGEXP_ONLY_DIGITS };
