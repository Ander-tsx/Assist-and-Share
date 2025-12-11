"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
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

interface RegisterErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validateRegister = () => {
    const errors: RegisterErrors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    // Regex Contraseña: Al menos 1 número, 1 carácter especial, min 6 longitud
    // (?=.*\d) -> busca dígito
    // (?=.*[\W_]) -> busca carácter no alfanumérico (símbolo)
    const hasNumber = /\d/;
    const hasSpecial = /[\W_]/;

    // Validación Nombre
    if (!firstName.trim()) {
      errors.firstName = "El nombre es requerido.";
    } else if (firstName.length < 2) {
      errors.firstName = "El nombre es muy corto (mínimo 2 letras).";
    }

    // Validación Apellido
    if (!lastName.trim()) {
      errors.lastName = "El apellido es requerido.";
    } else if (lastName.length < 2) {
      errors.lastName = "El apellido es muy corto (mínimo 2 letras).";
    }

    // Validación Email
    if (!email.trim()) {
      errors.email = "El correo es requerido.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Ingresa un correo válido (ej: nombre@gmail.com).";
    }

    // Validación Passwordw
    if (!password) {
      errors.password = "La contraseña es requerida.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    } else if (!hasNumber.test(password)) {
      errors.password = "La contraseña debe incluir al menos un número.";
    } else if (!hasSpecial.test(password)) {
      errors.password = "La contraseña debe incluir un carácter especial (@, #, !, etc).";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateRegister()) return;

    setLoading(true);

    try {
      await api.post("/auth/register", {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        role: "attendee",
      });
      router.push("/login");
    } catch (err) {
      let msg = "Error al registrarse.";

      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || "Error del servidor";
      } else if ((err as any).request) {
        msg = "No hay conexión con el servidor";
      } else if ((err as any).message) {
        msg = (err as any).message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <AuthLayout>
      <AuthCard title="Registrarse" subtitle="Inicia hoy creando una nueva cuenta">
        {/* 'noValidate' desactivamos las validaciones del navegador de las q se queja cesa y ponemos propias*/}
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="firstName"
              type="text"
              label="Nombre"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) setFieldErrors({...fieldErrors, firstName: undefined});
              }}
              placeholder="Pedro"
              error={fieldErrors.firstName}
            />

            <InputField
              id="lastName"
              type="text"
              label="Apellidos"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) setFieldErrors({...fieldErrors, lastName: undefined});
              }}
              placeholder="Juárez"
              error={fieldErrors.lastName}
            />
          </div>

          <InputField
            id="email"
            type="email"
            label="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined});
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
              if (fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined});
            }}
            placeholder="C0n7r4s3ñ4"
            error={fieldErrors.password}
          />

          <SubmitButton loading={loading} loadingText="Registrando…">
            Crear cuenta
          </SubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleLogin} />

        {error && <AlertMessage type="error" message={error} />}

        <AuthLink
          text="¿Ya tienes cuenta?"
          linkText="Inicia sesión"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}