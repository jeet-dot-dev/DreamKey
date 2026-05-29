import {z} from "zod" ;

export const signupSchema = z.object({
    username : z.string().max(100).trim(),
    email : z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone:z.string().length(10),
    image:z.string().optional(),
})

export const loginSchema = z.object({
    email : z.email(),
    password: z.string().min(6, "Password must be at least 6 characters"),

})