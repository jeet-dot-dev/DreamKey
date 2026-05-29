import {z} from "zod" ;

export const signupSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters").max(100, "Username must be less than 100 characters").trim(),
    email : z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
    phone: z.string().length(10, "Please enter a valid 10-digit phone number").regex(/^\d+$/, "Phone number must contain only digits"),
    image: z.string().optional().or(z.literal("")),
})

export const loginSchema = z.object({
    email : z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
})