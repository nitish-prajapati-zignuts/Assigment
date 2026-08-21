"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, KeyRound, MailOpen } from "lucide-react";
import { LoginIllustration } from "@/components/ui/illustrations";
import { callService } from "@/lib/serviceApi";
import { SERVICE_IDS } from "@/lib/serviceIds";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [activeTab, setActiveTab] = useState<"magic" | "otp">("magic");

  // Magic Link States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // OTP States
  const [otpStep, setOtpStep] = useState<"email" | "verify" | "success">("email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpEmailError, setOtpEmailError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeError, setOtpCodeError] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Magic Link Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle Magic Link Submission
  const onMagicSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await callService({
        serviceId: SERVICE_IDS.AUTH.GENERATE_MAGIC_LINK,
        payload: {
          email: data.email,
        },
      });
      console.log(response.data.data);
      setSubmittedEmail(response.data.data);
      setIsSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Send Request
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setOtpEmailError("");

    // Simple email validation
    if (!otpEmail) {
      setOtpEmailError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(otpEmail)) {
      setOtpEmailError("Invalid email address");
      return;
    }

    setIsOtpLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Verification OTP code sent to your email!");
      setOtpStep("verify");
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle OTP Code Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpCodeError("");

    if (!otpCode) {
      setOtpCodeError("OTP code is required");
      return;
    }
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setOtpCodeError("OTP must be a 6-digit number");
      return;
    }

    setIsOtpLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("OTP verified successfully!");
      setOtpStep("success");
    } catch (err) {
      toast.error("Invalid OTP code. Please try again.");
    } finally {
      setIsOtpLoading(false);
    }
  };

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
            <p className="text-xs lg:text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
              {/* Magic Link Success View */}
              {isSuccess && activeTab === "magic" && (
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
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Reset Link Sent</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                      We have sent a secure password reset link to{" "}
                      <strong className="text-zinc-855 dark:text-zinc-200">{submittedEmail}</strong>. Please check your
                      inbox.
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
              )}

              {/* OTP Success View */}
              {otpStep === "success" && activeTab === "otp" && (
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
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Verification Successful</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                      Your identity was successfully verified with the OTP code. Your temporary reset link has been
                      approved.
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
              )}

              {/* Form Views */}
              {((!isSuccess && activeTab === "magic") || (otpStep !== "success" && activeTab === "otp")) && (
                <>
                  <CardHeader className="space-y-1.5 text-center pb-2 pt-6">
                    <CardTitle className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                      Reset Password
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-550 dark:text-zinc-400">
                      Choose your preferred method to reset your password
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <Tabs
                      value={activeTab}
                      onValueChange={(val) => setActiveTab(val as "magic" | "otp")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-zinc-100/80 dark:bg-zinc-950/60 mb-5 h-11">
                        <TabsTrigger
                          value="magic"
                          className="rounded-xl py-2 font-bold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
                        >
                          Magic Link
                        </TabsTrigger>
                        <TabsTrigger
                          value="otp"
                          className="rounded-xl py-2 font-bold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
                        >
                          OTP Code
                        </TabsTrigger>
                      </TabsList>

                      {/* Magic Link Content */}
                      <TabsContent value="magic" className="space-y-4 outline-none">
                        <form onSubmit={handleSubmit(onMagicSubmit)}>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                Email Address
                              </Label>
                              <div className="relative group input-focus-glow rounded-2xl transition-all">
                                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="name@example.com"
                                  className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                                  {...register("email")}
                                />
                              </div>
                              {errors.email && (
                                <p className="text-[11px] font-semibold text-red-500 pl-1">{errors.email.message}</p>
                              )}
                            </div>

                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button
                                type="submit"
                                className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Sending Link...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Send Reset Link</span>
                                    <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </form>
                      </TabsContent>

                      {/* OTP Content */}
                      <TabsContent value="otp" className="space-y-4 outline-none">
                        {otpStep === "email" ? (
                          <form onSubmit={handleSendOtp}>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label
                                  htmlFor="otp-email"
                                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                                >
                                  Email Address
                                </Label>
                                <div className="relative group input-focus-glow rounded-2xl transition-all">
                                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                                  <Input
                                    id="otp-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={otpEmail}
                                    onChange={(e) => setOtpEmail(e.target.value)}
                                    className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                                  />
                                </div>
                                {otpEmailError && (
                                  <p className="text-[11px] font-semibold text-red-500 pl-1">{otpEmailError}</p>
                                )}
                              </div>

                              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                  type="submit"
                                  className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
                                  disabled={isOtpLoading}
                                >
                                  {isOtpLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Sending OTP...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Send OTP Code</span>
                                      <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </form>
                        ) : (
                          <form onSubmit={handleVerifyOtp}>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl">
                                <MailOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                                <span>
                                  We sent a 6-digit code to <strong>{otpEmail}</strong>.
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <Label
                                  htmlFor="otp-code"
                                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                                >
                                  Verification Code
                                </Label>
                                <div className="relative group input-focus-glow rounded-2xl transition-all">
                                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
                                  <Input
                                    id="otp-code"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                    className="pl-10 h-11 tracking-[0.2em] font-extrabold text-center bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:tracking-normal placeholder:font-normal placeholder:text-zinc-400 text-xs rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0"
                                  />
                                </div>
                                {otpCodeError && (
                                  <p className="text-[11px] font-semibold text-red-500 pl-1">{otpCodeError}</p>
                                )}
                              </div>

                              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                  type="submit"
                                  className="w-full bg-white text-zinc-955 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold h-11 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
                                  disabled={isOtpLoading}
                                >
                                  {isOtpLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Verifying...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Verify & Reset</span>
                                      <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                                    </>
                                  )}
                                </Button>
                              </motion.div>

                              <div className="flex items-center justify-between text-xs font-semibold px-1">
                                <button
                                  type="button"
                                  onClick={() => setOtpStep("email")}
                                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                                >
                                  Change Email
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendOtp()}
                                  className="text-indigo-650 dark:text-indigo-400 hover:underline underline-offset-4"
                                >
                                  Resend Code
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </TabsContent>
                    </Tabs>
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
              )}
            </Card>
          </div>

          <p className="text-center text-xs text-zinc-550 dark:text-zinc-400 font-medium">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
