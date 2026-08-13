"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/axios";

import { getErrorMessage } from "@/lib/apiTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Video, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          router.replace("/dashboard");
          return;
        }
      } catch (err) {
        console.log("Auth Error", err)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsVerifying(false);
      }
    };

    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2.5 font-semibold text-xs">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success("Welcome back! Signed in successfully.");
        router.push("/dashboard");
      } else {
        setErrorMessage("Login failed. Unexpected server response.");
        toast.error("Login failed. Unexpected server response.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const serverMsg = getErrorMessage(err) || "Invalid email or password. Please try again.";
      setErrorMessage(serverMsg);
      toast.error(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Ambient glowing gradients */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-20 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-24 -right-20 w-[450px] h-[450px] bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-6 relative z-10 my-8"
      >
        {/* Branding Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
          >
            <Video className="h-7 w-7" />
          </motion.div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                MeetNotes AI
              </h1>
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              AI-Powered Meeting Summaries & Central Action Tracker
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5 text-zinc-900 dark:text-zinc-100 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1.5 text-center pb-2 pt-6">
            <CardTitle className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access meetings and action items
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              {/* Error Alert Banner */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMessage}</span>
                </motion.div>
              )}

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-semibold text-red-500 pl-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="#"
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-red-500 pl-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 pb-6">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}