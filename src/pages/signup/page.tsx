import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// ---------------------- Zod Schema ----------------------

const SignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,15}$/, "Enter a valid phone number"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------- React Hook Form ----------------------

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  });

  // ---------------------- Submit ----------------------

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      const name = `${values.firstName} ${values.lastName}`;
      const response = await authService.signup(name, values.email, values.password);

      if (response.success && response.data) {
        setAuth(response.data);
        toast.success("Account created successfully!");
        navigate("/tracker");
      } else {
        toast.error(response.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please check your connection.");
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
          <div className="w-full max-sm:px-4 max-w-sm space-y-4">
            {/* Header */}
            <div className="text-left space-y-1">
              <p className="text-lg font-bold text-foreground">
                {t("signup.title")}
              </p>
              <p className="text-sm font-light text-foreground opacity-80">
                {t("signup.description")}
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              {/* First Name + Last Name */}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>{t("signup.firstName")}</Label>
                  <Input
                    placeholder={t("signup.firstNamePlaceholder")}
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>{t("signup.lastName")}</Label>
                  <Input
                    placeholder={t("signup.lastNamePlaceholder")}
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.email")}</Label>
                <Input
                  placeholder={t("signup.emailPlaceholder")}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.phone")}</Label>
                <Input
                  placeholder={t("signup.phonePlaceholder")}
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Password */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.password")}</Label>
                <Input
                  type="password"
                  placeholder={t("signup.passwordPlaceholder")}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}

              <div className="text-center space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⚪</span>
                      {t("signup.submitting")}
                    </>
                  ) : (
                    t("signup.submit")
                  )}
                </Button>

                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  {t("signup.loginLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
