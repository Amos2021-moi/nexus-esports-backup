"use client";

import {
  useState,
  useEffect,
  useMemo,
  type FormEvent,
  type ChangeEvent,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Shield,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                     */
/* -------------------------------------------------------------------------- */

interface FormState {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

type StrengthLevel = "Weak" | "Medium" | "Strong";

interface StrengthResult {
  score: number; // 0-4
  label: StrengthLevel;
  color: string; // bar colour
  textColor: string; // label colour
}

/* -------------------------------------------------------------------------- */
/*                                 Constants                                   */
/* -------------------------------------------------------------------------- */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

const SIGNUP_ENDPOINT = "/api/auth/signup";

/**
 * Maps server-side / network error identifiers to friendly messages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  EmailExists: "An account with this email already exists.",
  UsernameTaken: "That username is already taken. Try another.",
  ValidationError: "Please check your details and try again.",
  RateLimited: "Too many attempts. Please wait a moment and try again.",
  Network: "Network error. Please check your connection and try again.",
  default: "Something went wrong. Please try again.",
};

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Lightweight password-strength heuristic. */
function evaluatePassword(password: string): StrengthResult {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalise to 0-4.
  score = Math.min(score, 4);

  if (score <= 1) {
    return {
      score,
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-400",
    };
  }
  if (score <= 3) {
    return {
      score,
      label: "Medium",
      color: "bg-amber-500",
      textColor: "text-amber-400",
    };
  }
  return {
    score,
    label: "Strong",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  };
}

/* -------------------------------------------------------------------------- */
/*                            Animation variants                              */
/*               (identical to the Sign In page for consistency)              */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.07 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

/* -------------------------------------------------------------------------- */
/*                            Main Sign Up Form                                */
/* -------------------------------------------------------------------------- */

function SignUpForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const strength = useMemo(
    () => evaluatePassword(form.password),
    [form.password],
  );

  /* ----------------------------- Validation ----------------------------- */

  function validateField(name: keyof FormState, value: FormState): string | undefined {
    switch (name) {
      case "name":
        if (!value.name.trim()) return "Full name is required.";
        if (value.name.trim().length < 2)
          return "Name must be at least 2 characters.";
        return undefined;
      case "username":
        if (!value.username.trim()) return "Username is required.";
        if (value.username.trim().length < 3)
          return "Username must be at least 3 characters.";
        if (!USERNAME_REGEX.test(value.username.trim()))
          return "Use letters and numbers only (no spaces or symbols).";
        return undefined;
      case "email":
        if (!value.email.trim()) return "Email is required.";
        if (!EMAIL_REGEX.test(value.email.trim()))
          return "Enter a valid email address.";
        return undefined;
      case "password":
        if (!value.password) return "Password is required.";
        if (value.password.length < 6)
          return "Password must be at least 6 characters.";
        return undefined;
      case "confirmPassword":
        if (!value.confirmPassword) return "Please confirm your password.";
        if (value.confirmPassword !== value.password)
          return "Passwords do not match.";
        return undefined;
      default:
        return undefined;
    }
  }

  function validateAll(): boolean {
    const next: FormErrors = {
      name: validateField("name", form),
      username: validateField("username", form),
      email: validateField("email", form),
      password: validateField("password", form),
      confirmPassword: validateField("confirmPassword", form),
      acceptTerms: form.acceptTerms
        ? undefined
        : "You must accept the Terms & Conditions.",
    };

    // Strip undefined keys.
    (Object.keys(next) as (keyof FormErrors)[]).forEach((k) => {
      if (!next[k]) delete next[k];
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  /* ----------------------------- Handlers ------------------------------- */

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    const fieldName = name as keyof FormState;

    setForm((prev) => {
      const updated: FormState = {
        ...prev,
        [fieldName]: type === "checkbox" ? checked : value,
      };

      // Real-time, on-change re-validation for the changed field.
      setErrors((prevErr) => {
        const nextErr = { ...prevErr };
        if (fieldName === "acceptTerms") {
          if (checked) delete nextErr.acceptTerms;
        } else {
          const msg = validateField(fieldName, updated);
          if (msg) nextErr[fieldName as keyof FormErrors] = msg;
          else delete nextErr[fieldName as keyof FormErrors];

          // Keep confirm-password in sync when password changes.
          if (fieldName === "password") {
            const confirmMsg = validateField("confirmPassword", updated);
            if (updated.confirmPassword) {
              if (confirmMsg) nextErr.confirmPassword = confirmMsg;
              else delete nextErr.confirmPassword;
            }
          }
        }
        return nextErr;
      });

      return updated;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      // Try to parse a JSON body; tolerate empty/non-JSON responses.
      let data: { error?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* ignore parse errors */
      }

      if (!res.ok) {
        // Map known server codes / status codes to friendly messages.
        let code = data?.error ?? "";
        if (!code) {
          if (res.status === 409) code = "EmailExists";
          else if (res.status === 422) code = "ValidationError";
          else if (res.status === 429) code = "RateLimited";
        }

        // Field-specific feedback for duplicates.
        if (code === "EmailExists") {
          setErrors((prev) => ({
            ...prev,
            email: ERROR_MESSAGES.EmailExists,
          }));
        } else if (code === "UsernameTaken") {
          setErrors((prev) => ({
            ...prev,
            username: ERROR_MESSAGES.UsernameTaken,
          }));
        }

        toast.error(
          ERROR_MESSAGES[code] ?? data?.message ?? ERROR_MESSAGES.default,
        );
        return;
      }

      toast.success("Account created successfully! Please sign in.");

      // Brief delay so the user can register the toast before navigating.
      setTimeout(() => {
        router.push("/auth/signin?registered=true");
      }, 800);
    } catch {
      toast.error(ERROR_MESSAGES.Network);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ------------------------------- Render ------------------------------- */

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: { iconTheme: { primary: "#4f46e5", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      {/* Decorative gradient background (matches Sign In) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/30 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Brand */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col items-center text-center"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 blur-md opacity-60" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-900/50">
                <Shield className="h-9 w-9 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              Nexus Esports
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {greeting} — create your account
            </p>
          </motion.div>

          {/* Glass card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Sign up</h2>
              <p className="mt-1 text-sm text-gray-400">
                Join the arena and start competing today.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Full name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-gray-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.name
                        ? "border-red-500/60 focus:ring-red-500/50"
                        : "border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/50"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <AtSign className="h-5 w-5" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="janedoe"
                    value={form.username}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                    className={`min-h-[44px] w-full rounded-xl border bg-gray-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.username
                        ? "border-red-500/60 focus:ring-red-500/50"
                        : "border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/50"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p id="username-error" className="mt-1.5 text-xs text-red-400">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`min-h-[44px] w-full rounded-xl border bg-gray-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.email
                        ? "border-red-500/60 focus:ring-red-500/50"
                        : "border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/50"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password - Clean Flex Layout */}
<div>
  <label
    htmlFor="password"
    className="mb-1.5 block text-sm font-medium text-gray-300"
  >
    Password
  </label>
  <div className="flex items-center rounded-xl border border-white/10 bg-gray-900/60 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/50">
    {/* Left: Lock Icon */}
    <div className="flex items-center pl-3 text-gray-500 flex-shrink-0">
      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    
    {/* Middle: Input - takes all space */}
    <input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      autoComplete="new-password"
      placeholder="••••••••"
      value={form.password}
      onChange={handleChange}
      disabled={isSubmitting}
      aria-invalid={!!errors.password}
      aria-describedby={errors.password ? "password-error" : form.password ? "password-strength" : undefined}
      className="flex-1 bg-transparent py-2.5 px-2 text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 min-h-[44px] min-w-[80px]"
    />
    
    {/* Right: Eye Button */}
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      disabled={isSubmitting}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      className="flex items-center px-3 text-gray-500 transition hover:text-gray-300 focus:text-indigo-400 focus:outline-none disabled:opacity-60 min-h-[44px] flex-shrink-0"
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </button>
  </div>
  
  {/* Password strength indicator */}
  <AnimatePresence>
    {form.password && !errors.password && (
      <motion.div
        id="password-strength"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2"
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < strength.score ? strength.color : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className={`mt-1 text-xs font-medium ${strength.textColor}`}>
          Password strength: {strength.label}
        </p>
      </motion.div>
    )}
  </AnimatePresence>

  {errors.password && (
    <p id="password-error" className="mt-1.5 text-xs text-red-400">
      {errors.password}
    </p>
  )}
</div>

{/* Confirm Password - Clean Flex Layout */}
<div>
  <label
    htmlFor="confirmPassword"
    className="mb-1.5 block text-sm font-medium text-gray-300"
  >
    Confirm password
  </label>
  <div className="flex items-center rounded-xl border border-white/10 bg-gray-900/60 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/50">
    {/* Left: Lock Icon */}
    <div className="flex items-center pl-3 text-gray-500 flex-shrink-0">
      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    
    {/* Middle: Input - takes all space */}
    <input
      id="confirmPassword"
      name="confirmPassword"
      type={showConfirm ? "text" : "password"}
      autoComplete="new-password"
      placeholder="••••••••"
      value={form.confirmPassword}
      onChange={handleChange}
      disabled={isSubmitting}
      aria-invalid={!!errors.confirmPassword}
      aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
      className="flex-1 bg-transparent py-2.5 px-2 text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 min-h-[44px] min-w-[80px]"
    />
    
    {/* Right: Eye Button */}
    <button
      type="button"
      onClick={() => setShowConfirm((s) => !s)}
      disabled={isSubmitting}
      aria-label={showConfirm ? "Hide password" : "Show password"}
      aria-pressed={showConfirm}
      className="flex items-center px-3 text-gray-500 transition hover:text-gray-300 focus:text-indigo-400 focus:outline-none disabled:opacity-60 min-h-[44px] flex-shrink-0"
    >
      {showConfirm ? (
        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </button>
  </div>
  {errors.confirmPassword && (
    <p id="confirm-error" className="mt-1.5 text-xs text-red-400">
      {errors.confirmPassword}
    </p>
  )}
</div>

              {/* Terms & Conditions */}
              <div>
                <label
                  htmlFor="acceptTerms"
                  className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-gray-300"
                >
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.acceptTerms}
                    aria-describedby={
                      errors.acceptTerms ? "terms-error" : undefined
                    }
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-white/20 bg-gray-900/60 text-indigo-600 accent-indigo-600 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-0"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p id="terms-error" className="mt-1.5 text-xs text-red-400">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.01 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.99 } : undefined}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Create account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-xs text-gray-600"
          >
            Protected by industry-standard encryption. Your data stays yours.
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Page export (Suspense wrapper)                        */
/* -------------------------------------------------------------------------- */

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
