import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

// ---------------------- Zod Schema ----------------------
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Default credentials for demo
  const DEFAULT_EMAIL = "";
  const DEFAULT_PASSWORD = "";

  // ---------------------- React Hook Form ----------------------
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  // ---------------------- Load saved email ----------------------
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");

    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    } else {
      // Set default email if no saved email exists
      setValue("email", DEFAULT_EMAIL);
      setValue("password", DEFAULT_PASSWORD);
    }
  }, [setValue]);

  // ---------------------- Submit ----------------------
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      if (values.rememberMe) {
        localStorage.setItem("savedEmail", values.email);
        localStorage.setItem("rememberMeFlag", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.setItem("rememberMeFlag", "false");
      }

      const response = await authService.login(values.email, values.password, values.rememberMe);

      if (response.success && response.data) {
        setAuth(response.data);
        toast.success("Login successful");
        // Successful login, redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        // Handle error message
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
        {/* LEFT SECTION */}
        <div className="flex items-center justify-center gap-2 bg-primary text-white p-8 ">
          {" "}
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-[0px_1px_15px_-3px_rgba(255,_255,_255,_1)]">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Axoracomp
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-center justify-center bg-background px-6 py-10 min-h-screen">
          <div className="w-full max-w-sm space-y-4">
            {/* Header */}
            <div className="text-left space-y-1">
              <p className="text-lg font-bold text-foreground">
                {t("login.welcome")}
              </p>
              <p className="text-sm font-light text-foreground opacity-80">
                {t("login.signInHint")}
              </p>
            </div>

            {/* Demo credentials hint */}
            {/* <div className="bg-muted/50 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{t("login.demoCredentials")}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Email:{" "}
                <span className="font-mono bg-background px-1 py-0.5 rounded">
                  {DEFAULT_EMAIL}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Password:{" "}
                <span className="font-mono bg-background px-1 py-0.5 rounded">
                  {DEFAULT_PASSWORD}
                </span>
              </p>
            </div> */}

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <Label>{t("login.emailLabel")}</Label>
                <Input
                  placeholder={t("login.emailPlaceholder")}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <Label>{t("login.passwordLabel")}</Label>
                <Input
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex text-sm text-muted-foreground justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setValue("rememberMe", checked)
                    }
                    disabled={isLoading}
                  />
                  <Label>{t("login.rememberMe")}</Label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>

              {/* Submit */}
              <div className="text-center space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className=" h-4 w-4 animate-spin" />
                      {t("login.loggingIn")}
                    </>
                  ) : (
                    t("login.loginButton")
                  )}
                </Button>

                <Link
                  to="/signup"
                  className="text-sm text-primary hover:underline"
                >
                  {t("login.signupLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
