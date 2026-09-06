"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Invalid email or password");
      return;
    }
    router.push(searchParams.get("from") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your role-based DRISHTI dashboard.
        </p>
      </div>

      {/* Demo Credentials Quick-Select */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Demo Roles (Click to auto-fill)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "admin@example.com");
              form.setValue("password", "Password@123");
            }}
            className="flex flex-col items-start p-2 rounded-lg border bg-muted/40 hover:bg-muted text-left transition-colors cursor-pointer"
          >
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">SDM</span>
            <span className="text-[11px] text-muted-foreground">admin@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "dept1@example.com");
              form.setValue("password", "Password@123");
            }}
            className="flex flex-col items-start p-2 rounded-lg border bg-muted/40 hover:bg-muted text-left transition-colors cursor-pointer"
          >
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Department 1</span>
            <span className="text-[11px] text-muted-foreground">dept1@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "dept2@example.com");
              form.setValue("password", "Password@123");
            }}
            className="flex flex-col items-start p-2 rounded-lg border bg-muted/40 hover:bg-muted text-left transition-colors cursor-pointer"
          >
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Department 2</span>
            <span className="text-[11px] text-muted-foreground">dept2@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "agency-officer@example.com");
              form.setValue("password", "Password@123");
            }}
            className="flex flex-col items-start p-2 rounded-lg border bg-muted/40 hover:bg-muted text-left transition-colors cursor-pointer"
          >
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Agency Officer</span>
            <span className="text-[11px] text-muted-foreground">agency-officer@...</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      type="email"
                      placeholder="you@university.edu"
                      autoComplete="email"
                      className="pl-9 h-11 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-9 h-11 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 font-semibold text-sm group relative overflow-hidden"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in to DRISHTI
                <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
