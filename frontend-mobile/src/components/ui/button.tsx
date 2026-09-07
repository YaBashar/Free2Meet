/**
 * Button
 *
 * Pressable with shadcn-style `variant` and `size` tokens for NativeWind.
 * Does not own navigation or form submit behaviour — callers pass `onPress`.
 */

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary active:bg-primary/90",
        destructive: "bg-destructive active:bg-destructive/90",
        outline:
          "border border-border bg-background active:bg-accent dark:bg-input/30",
        secondary: "bg-secondary active:bg-secondary/80",
        ghost: "active:bg-accent",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-2 native:h-12 native:px-5",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-sm font-outfit-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "",
      sm: "",
      lg: "text-base",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    textClassName?: string;
  };

/**
 * Renders a themed pressable. String children are wrapped in styled `Text`;
 * pass custom nodes when you need icons or multi-line content.
 */
function Button({
  className,
  variant,
  size,
  children,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        disabled && "opacity-50",
        buttonVariants({ variant, size }),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            buttonTextVariants({ variant, size }),
            textClassName,
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
