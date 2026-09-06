"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, ArrowRight, Landmark, ChevronDown } from "lucide-react";
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
import { getLoginDepartments } from "@/features/departments/actions";

export interface LoginDepartment {
  id: string;
  name: string;
  code: string;
  email: string;
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ departments = [] }: { departments?: LoginDepartment[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [deptList, setDeptList] = useState<LoginDepartment[]>(departments);
  const [selectedDeptId, setSelectedDeptId] = useState("");

  useEffect(() => {
    if (departments.length === 0) {
      getLoginDepartments()
        .then((res) => setDeptList(res))
        .catch(() => {});
    } else {
      setDeptList(departments);
    }
  }, [departments]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message ?? "Invalid email or password");
        return;
      }
      router.push(searchParams.get("from") ?? "/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      toast.error(
        err?.message?.includes("Failed to fetch")
          ? "Unable to reach server. Please ensure the development server is running."
          : (err?.message ?? "An unexpected error occurred during sign-in.")
      );
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Demo Roles (Click to auto-fill)
          </p>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
            Password: Password@123
          </span>
        </div>

        {/* Global Roles: SDM & Agency */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedDeptId("");
              form.setValue("email", "admin@example.com");
              form.setValue("password", "Password@123");
              toast.info("Auto-filled SDM credentials");
            }}
            className="flex flex-col items-start p-2.5 rounded-lg border bg-muted/40 hover:bg-muted hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all cursor-pointer"
          >
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span>🏛️</span> SDM (Admin)
            </span>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5">admin@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDeptId("");
              form.setValue("email", "agency-officer@example.com");
              form.setValue("password", "Password@123");
              toast.info("Auto-filled Agency Officer credentials");
            }}
            className="flex flex-col items-start p-2.5 rounded-lg border bg-muted/40 hover:bg-muted hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all cursor-pointer"
          >
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>⚡</span> Agency Officer
            </span>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5">agency-officer@...</span>
          </button>
        </div>

        {/* Dynamic Department Dropdown */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="dept-select" className="font-semibold text-foreground flex items-center gap-1.5">
              <Landmark className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Department Officer</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              {deptList.length} created {deptList.length === 1 ? "dept" : "depts"}
            </span>
          </div>

          <div className="relative">
            <select
              id="dept-select"
              value={selectedDeptId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDeptId(id);
                const chosen = deptList.find((d) => d.id === id);
                if (chosen) {
                  form.setValue("email", chosen.email);
                  form.setValue("password", "Password@123");
                  toast.success(`Selected ${chosen.name} (${chosen.email})`);
                }
              }}
              className="w-full h-10 px-3 pr-8 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 focus:bg-background focus:border-indigo-500 text-xs font-medium text-foreground transition-all cursor-pointer outline-none appearance-none"
            >
              <option value="" disabled>
                -- Choose Department to Auto-fill Officer --
              </option>
              {deptList.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  🏢 {dept.name} ({dept.code}) — {dept.email}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ChevronDown className="size-4" />
            </div>
          </div>
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
