"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/api";
import { AxiosError } from "axios";
import AuthLayout from "../../components/(auth)/AuthLayout";
import AuthCard from "../../components/(auth)/AuthCard";
import AlertMessage from "../../components/(auth)/AlertMessage";
import InputField from "../../components/(auth)/InputField";
import PasswordInput from "../../components/(auth)/PasswordInput";
import SubmitButton from "../../components/(auth)/SubmitButton";
import AuthDivider from "../../components/(auth)/AuthDivider";
import GoogleButton from "../../components/(auth)/GoogleButton";
import AuthLink from "../../components/(auth)/AuthLink";

const ERROR_MESSAGES: Record<string, string> = {
  no_token: "No se recibió el token",
  callback_failed: "Error al autenticar con Google",
  session_expired: "Los datos son inválidos",
  authentication_failed: "Falló la autenticación",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estado para errores específicos de cada campo
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push("/events");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(ERROR_MESSAGES[urlError] || "Error de autenticación");
    }
  }, [searchParams]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    // Regex estándar para emails
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!email.trim()) {
      errors.email = "Por favor, ingresa tu correo electrónico.";
    } else if (!emailRegex.test(email)) {
      errors.email = "El formato del correo es incorrecto (ej: usuario@dominio.com).";
    }

    if (!password) {
      errors.password = "Ingresa tu contraseña para continuar.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Si la validación falla, no enviamos nada
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data.success || !data.value?.token) {
        throw new Error("No se recibió el token de autenticación");
      }

      document.cookie = `auth-token=${data.value.token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax; Secure`;

      await checkAuth();
      window.location.href = "/events";

    } catch (err) {
      const message = err instanceof AxiosError
        ? err.response?.data?.message || "Error del servidor"
        : err instanceof Error
          ? err.message
          : "Error al iniciar sesión";

      setError(message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <AuthLayout>
      <AuthCard title="Iniciar Sesión" subtitle="Accede a tu espacio personal">
        {error && <AlertMessage type="error" message={error} />}

        {/* 'noValidate' desactiva las burbujas nativas del navegador */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4" noValidate>
          <InputField
            id="email"
            type="email"
            label="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Limpiamos el error en cuanto el usuario escribe
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
            }}
            placeholder="correo@ejemplo.com"
            error={fieldErrors.email}
          />

          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
            }}
            placeholder="C0n7r4s3ñ4"
            error={fieldErrors.password}
          />

          <AuthLink
            text="¿Olvidaste tu contraseña?"
            linkText="Recupérala"
            href="/forgot-password"
          />

          <SubmitButton loading={loading} loadingText="Iniciando sesión...">
            Iniciar sesión
          </SubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleLogin} />

        <AuthLink
          text="¿No tienes cuenta?"
          linkText="Regístrate"
          href="/signup"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}