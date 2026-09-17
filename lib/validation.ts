import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const onboardingStep1Schema = z.object({
  opinionStyle: z.enum(["directly", "context_first", "story", "questions"], {
    errorMap: () => ({ message: "Veuillez sélectionner un style" }),
  }),
});

export const onboardingStep2Schema = z.object({
  formalityLevel: z.number().min(1).max(5),
});

export const onboardingStep3Schema = z.object({
  hardLesson: z.string().min(10, "Raconte au moins une phrase détaillée"),
});

export const onboardingStep4Schema = z.object({
  styleExamples: z.array(z.string()).max(5).optional().default([]),
});

export const onboardingCompleteSchema = z.object({
  opinionStyle: z.enum(["directly", "context_first", "story", "questions"]).optional(),
  formalityLevel: z.number().min(1).max(5).optional(),
  hardLesson: z.string().optional(),
  styleExamples: z.array(z.string()).max(5).optional().default([]),
});

export const generatePostSchema = z.object({
  idea: z.string().min(1, "L'idée ne peut pas être vide").max(2000, "L'idée ne peut pas dépasser 2000 caractères"),
  format: z.enum(["text", "story", "educational", "opinion", "case_study", "personal_experience"], {
    errorMap: () => ({ message: "Format invalide" }),
  }),
  tone: z.enum(["direct", "conversational", "professional", "provocative", "thoughtful"], {
    errorMap: () => ({ message: "Ton invalide" }),
  }),
});

export const postFeedbackSchema = z.object({
  soundsLikeMe: z.boolean(),
  reasons: z.array(
    z.enum(["too_formal", "too_generic", "not_me", "too_long", "wrong_tone", "other"])
  ).optional(),
});

export const regeneratePostSchema = z.object({
  instruction: z.enum(["regenerate", "improve_hook", "shorten", "more_direct", "change_tone"]),
  newTone: z.enum(["direct", "conversational", "professional", "provocative", "thoughtful"]).optional(),
}).refine((data) => {
  if (data.instruction === "change_tone" && !data.newTone) {
    return false;
  }
  return true;
}, {
  message: "Le nouveau ton est requis lors du changement de ton",
  path: ["newTone"],
});

export const updatePostSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["draft", "completed", "archived"]).optional(),
});

export const updateVoiceProfileSchema = z.object({
  directness: z.number().min(0).max(1).optional(),
  storytelling: z.number().min(0).max(1).optional(),
  formality: z.number().min(0).max(1).optional(),
  humor: z.number().min(0).max(1).optional(),
  technicality: z.number().min(0).max(1).optional(),
  emotionality: z.number().min(0).max(1).optional(),
  styleExamples: z.array(z.string()).max(5).optional(),
  preferredPhrases: z.array(z.string()).optional(),
  avoidedPhrases: z.array(z.string()).optional(),
});

export const updatePersonalityProfileSchema = z.object({
  directness: z.number().min(0).max(1).optional(),
  storytelling: z.number().min(0).max(1).optional(),
  formality: z.number().min(0).max(1).optional(),
  humor: z.number().min(0).max(1).optional(),
  technicality: z.number().min(0).max(1).optional(),
  emotionalExpression: z.number().min(0).max(1).optional(),
  opinionStrength: z.number().min(0).max(1).optional(),
  vulnerability: z.number().min(0).max(1).optional(),
});
