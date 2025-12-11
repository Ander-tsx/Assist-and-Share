"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../lib/api";
import { AxiosError } from "axios";
import { CheckCircle } from "lucide-react";
import AuthLayout from "../../components/(auth)/AuthLayout";
import AuthCard from "../../components/(auth)/AuthCard";
import AlertMessage from "../../components/(auth)/AlertMessage";
import PasswordInput from "../../components/(auth)/PasswordInput";
import SubmitButton from "../../components/(auth)/SubmitButton";
import AuthLink from "../../components/(auth)/AuthLink";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  
  // Estado para errores de validación
  const [fieldErrors, setFieldErrors] = useState<{ password?: string }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token de recuperación no válido o expirado");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // Validación estricta de contraseña
  const validateForm = () => {
    const errors: { password?: string } = {};
    const hasNumber = /\d/;
    const hasSpecial = /[\W_]/;

    if (!password) {
      errors.password = "La nueva contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    } else if (!hasNumber.test(password)) {
      errors.password = "Debe incluir al menos un número.";
    } else if (!hasSpecial.test(password)) {
      errors.password = "Debe incluir al menos un carácter especial (@, #, etc).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Token no válido");
      return;
    }

    // Validación antes de enviar
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (data.success) {
        setSuccess(true);
        // Esperamos un poco antes de redirigir para que el usuario vea el éxito
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Error del servidor"
          : "Error al restablecer la contraseña";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Restablecer Contraseña" subtitle="Ingresa tu nueva contraseña">
        {error && <AlertMessage type="error" message={error} />}

        {token && !success && !error && (
          <AlertMessage type="info" message="Token recibido. Establece tu nueva contraseña." />
        )}

        {success && (
          <AlertMessage
            type="success"
            message="Contraseña actualizada. Redirigiendo…"
            icon={<CheckCircle size={20} className="text-green-400" />}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            id="password"
            label="Nueva contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              // Limpiar error al escribir
              if (fieldErrors.password) setFieldErrors({});
            }}
            placeholder="C0n7r4s3ñ4"
            disabled={!token || success}
            error={fieldErrors.password}
          />

          <SubmitButton
            loading={loading}
            loadingText="Restableciendo…"
            disabled={!token || success}
          >
            {success ? (
              <>
                <CheckCircle size={20} />
                Contraseña actualizada
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </SubmitButton>
        </form>

        <div className="mt-6">
          <AuthLink
            text="¿Recordaste tu contraseña?"
            linkText="Iniciar sesión"
            href="/login"
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}