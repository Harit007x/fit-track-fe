import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { authService } from "@/services/auth.service";

// ---------------------- Zod Schema ----------------------
const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------- React Hook Form ----------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // ---------------------- Submit ----------------------
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(values.email);
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.message || "Something went wrong.");
      }
    } catch (error: any) {
      console.error("Forgot password request failed:", error);
      setError(error.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- Resend Handler ----------------------
  const handleResend = async () => {
    // We need the email from the form
    const email = (document.getElementsByName("email")[0] as HTMLInputElement)?.value;
    if (!email) {
      setError("Email is required to resend.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(false);
      setTimeout(() => setIsSubmitted(true), 100);
    } catch (error: any) {
      console.error("Resend failed:", error);
      setError(error.response?.data?.message || "Failed to resend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- Back to Login ----------------------
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
        {/* LEFT SECTION */}
        <div className="flex items-center justify-center gap-2 bg-primary text-white p-8">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-[0px_1px_15px_-3px_rgba(255,_255,_255,_1)]">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Axoracomp
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-center justify-center bg-background px-6 py-10 min-h-screen">
          <div className="w-full max-sm:px-4 max-w-sm space-y-4">
            {/* Header */}
            <div className="text-left space-y-1">
              <p className="text-lg font-bold text-foreground">
                {t("forgotPassword.title")}
              </p>
              <p className="text-sm font-light text-foreground opacity-80">
                {!isSubmitted 
                  ? t("forgotPassword.description")
                  : t("forgotPassword.successDescription")}
              </p>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">
                      {t("forgotPassword.resetLinkSent")}
                    </p>
                    <p className="text-xs text-green-700">
                      {t("forgotPassword.resetLinkSentDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800">
                      Error
                    </p>
                    <p className="text-xs text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FORM */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                {/* Email */}
                <div className="flex flex-col gap-1">
                  <Label>{t("forgotPassword.emailLabel")}</Label>
                  <Input
                    type="email"
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    {...register("email")}
                    disabled={isLoading}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Help Text */}
                <p className="text-xs text-muted-foreground">
                  {t("forgotPassword.helpText")}
                </p>

                {/* Submit */}
                <div className="text-center space-y-3">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin">⚪</span>
                        {t("forgotPassword.submitting")}
                      </>
                    ) : (
                      t("forgotPassword.submit")
                    )}
                  </Button>
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword.backToLogin")}
                </Link>
                  {/* <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm text-primary hover:underline"
                    onClick={handleBackToLogin}
                  >
                    Back to Login
                  </Button> */}
                </div>
              </form>
            ) : (
              /* Success State Actions */
              <div className="space-y-4 py-2">
                <div className="text-center space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleResend}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin">⚪</span>
                        {t("forgotPassword.resending")}
                      </>
                    ) : (
                      t("forgotPassword.resend")
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm text-primary hover:underline"
                    onClick={handleBackToLogin}
                  >
                    {t("forgotPassword.returnToLogin")}
                  </Button>
                </div>

                {/* Additional Help */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {t("forgotPassword.noEmailHint")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}