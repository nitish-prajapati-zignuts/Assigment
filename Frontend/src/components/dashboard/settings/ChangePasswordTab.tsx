import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    KeyRound,
    Eye,
    EyeOff,
    Check,
    X,
    ArrowRight,
    AlertCircle,
    Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

// 1. Define Zod validation schema
const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: "Current password is required" }),
        newPassword: z
            .string()
            .min(8, "At least 8 characters long")
            .regex(/[A-Z]/, "Contains at least one uppercase letter")
            .regex(/[0-9]/, "Contains at least one number")
            .regex(/[^A-Za-z0-9]/, "Contains at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePassword() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    // 2. Initialize React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
    });

    // Watch fields for dynamic rule updates
    const watchedNewPassword = watch("newPassword", "");

    // Password Requirement Checklist
    const requirements = [
        { label: "At least 8 characters long", met: watchedNewPassword.length >= 8 },
        { label: "Contains at least one uppercase letter", met: /[A-Z]/.test(watchedNewPassword) },
        { label: "Contains at least one number", met: /[0-9]/.test(watchedNewPassword) },
        { label: "Contains at least one special character", met: /[^A-Za-z0-9]/.test(watchedNewPassword) },
    ];

    // 3. Submit Handler
    const onSubmit = async (data: ChangePasswordFormValues) => {
        try {
            const response = await api.post("/auth/change-password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            })

            if (response.status === 200) {
                toast.success(response.data.message)
            }
        } catch (error) {
            toast.error("Something Went Wrong")
        }

    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6"
        >
            {/* Change Password Card */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
                    <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                        <KeyRound className="w-5 h-5" />
                    </span>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Change Password
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Ensure your account is using a long, random password to stay secure.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("currentPassword")}
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all pr-11 ${errors.currentPassword
                                    ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                                    : "border-zinc-200 dark:border-zinc-700/80 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.currentPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register("newPassword")}
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all pr-11 ${errors.newPassword
                                        ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-zinc-200 dark:border-zinc-700/80 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Confirm New Password
                            </label>
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                placeholder="••••••••••••"
                                className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword
                                    ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                                    : "border-zinc-200 dark:border-zinc-700/80 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    }`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Password Validation Requirements */}
                    {watchedNewPassword && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-2 text-xs"
                        >
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                                Password Requirements:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        {req.met ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <X className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        )}
                                        <span
                                            className={
                                                req.met
                                                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                                    : "text-zinc-400"
                                            }
                                        >
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Feedback & Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                                >
                                    <Check className="w-4 h-4" /> Password updated successfully!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="w-full sm:w-auto ml-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <><Loader2 className="animate-spin" /> Updating Password...</> : "Update Password"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}