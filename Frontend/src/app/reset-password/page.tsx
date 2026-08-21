"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Lock, XCircle } from "lucide-react";
import { LoginIllustration } from "@/components/ui/illustrations";
import { callService } from "@/lib/serviceApi";
import { SERVICE_IDS } from "@/lib/serviceIds";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Password reset token is missing from the link");
      return;
    }

    setIsLoading(true);
    try {
      await callService({
        serviceId: SERVICE_IDS.AUTH.RESET_PASSWORD_WITH_TOKEN,
        payload: {
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      });

      setIsSuccess(true);
      toast.success("Password reset successful!");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link might be invalid or expired.";
      toast.error(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 shadow-sm"
        >
          <XCircle className="h-6 w-6 stroke-[2.2]" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Invalid Reset Link</h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-sm">
            This password reset link is invalid because the security token is missing. Please check the URL or request a
            new reset link.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full pt-2">
          <Link href="/forgot-password" className="w-full block">
            <Button className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs">
              <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
              <span>Back to Forgot Password</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <CheckCircle2 className="h-6 w-6 stroke-[2.2]" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Password Reset Successful</h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-sm">
            Your password has been successfully updated. You can now log in to your account with your new password.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full pt-2">
          <Link href="/login" className="w-full block">
            <Button className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs">
              <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
              <span>Back to Sign In</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1.5 text-center pb-2 pt-6">
        <CardTitle className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-zinc-550 dark:text-zinc-400">
          Enter your new password below to update your Syncra AI account credentials
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* New Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                New Password
              </Label>
              <div className="relative group input-focus-glow rounded-2xl transition-all">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] font-semibold text-red-500 pl-1 leading-normal">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Confirm New Password
              </Label>
              <div className="relative group input-focus-glow rounded-2xl transition-all">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-semibold text-red-500 pl-1 leading-normal">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
              <Button
                type="submit"
                className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
        <div className="flex items-center justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </CardFooter>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="relative h-screen w-screen flex flex-col lg:flex-row bg-background text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Ambient glowing gradients background */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Floating geometric shapes */}
      <div className="absolute top-[15%] left-[10%] w-16 h-16 border border-indigo-500/10 dark:border-indigo-400/10 rounded-2xl rotate-12 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-12 h-12 border border-purple-500/10 dark:border-purple-400/10 rounded-full pointer-events-none" />

      {/* Left Side: Modern SVG Illustration */}
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-8 lg:p-12 bg-indigo-50/5 dark:bg-zinc-900/5 border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/50 h-[40%] lg:h-full overflow-hidden">
        <div className="max-w-md xl:max-w-lg w-full text-center space-y-4 lg:space-y-6">
          <div className="space-y-1.5 lg:space-y-3">
            <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Meet Syncra AI
            </h2>
            <p className="text-xs lg:text-sm font-semibold text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Transform meetings into structured action items, summary transcripts, and automated deliverables.
            </p>
          </div>
          <div className="w-full aspect-square max-w-[200px] sm:max-w-[240px] lg:max-w-[320px] mx-auto flex items-center justify-center">
            <LoginIllustration className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Right Side: Reset Password Cards */}
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 h-[60%] lg:h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-6 relative z-10"
        >
          {/* Form Card */}
          <div className="gradient-border-wrap rounded-3xl p-[1px]">
            <Card className="border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5 text-zinc-900 dark:text-zinc-100 rounded-3xl overflow-hidden">
              <Suspense
                fallback={
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-semibold text-zinc-500">Loading form...</span>
                  </div>
                }
              >
                <ResetPasswordForm />
              </Suspense>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
