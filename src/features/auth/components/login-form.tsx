"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginWithPragya } from "@/features/auth/server-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().min(1, "Please enter your Email or User ID"),
  password: z.string().min(1, "Please enter your password"),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    startTransition(async () => {
      try {
        const rawInput = values.email.trim();
        const emailToUse = rawInput.includes("@") ? rawInput : `${rawInput.toLowerCase()}@example.com`;

        const res = await loginWithPragya(emailToUse, values.password);

        if (res?.error) {
          toast.error(res.error);
          setLoading(false);
          return;
        }
        router.push(searchParams.get("from") ?? "/dashboard");
        router.refresh();
      } catch (err: unknown) {
        console.error("Sign in failed:", err);
        toast.error("Network error, please try again.");
        setLoading(false);
      }
    });
  }

  return (
    <div className="w-full space-y-7">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-[#0f1d40] text-center">
        Sign In
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email / User ID */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Email/User ID"
                    autoComplete="username"
                    className="h-11 px-4 rounded-md border border-[#e2e8f0] bg-white text-slate-900 placeholder:text-[#94a3b8] text-sm focus-visible:ring-1 focus-visible:ring-[#1877f2] focus-visible:border-[#1877f2] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-11 px-4 rounded-md border border-[#e2e8f0] bg-white text-slate-900 placeholder:text-[#94a3b8] text-sm focus-visible:ring-1 focus-visible:ring-[#1877f2] focus-visible:border-[#1877f2] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Remember Me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0 pt-0.5 pb-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="rememberMe"
                    className="size-4 rounded border-[#cbd5e1] data-[state=checked]:bg-[#1877f2] data-[state=checked]:border-[#1877f2]"
                  />
                </FormControl>
                <label
                  htmlFor="rememberMe"
                  className="text-xs sm:text-sm font-normal text-slate-700 cursor-pointer select-none"
                >
                  Remember Me
                </label>
              </FormItem>
            )}
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-md bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464cf] text-white font-medium text-sm sm:text-base shadow-none transition-colors mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
