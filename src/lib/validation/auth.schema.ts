import { z } from "zod";

export const authSchemas = {
  login: z.object({
    email: z.string().email("Nieprawidłowy adres email"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
  }),

  signup: z.object({
    email: z.string().email("Nieprawidłowy adres email"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  }),

  resetPassword: z.object({
    email: z.string().email("Nieprawidłowy adres email"),
  }),
}; 