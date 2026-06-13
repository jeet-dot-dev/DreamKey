import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import { signupSchema, loginSchema } from "../schemas/user.schema.js";
import { z } from "zod";

export const signup = async (req: Request, res: Response) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: z.treeifyError(result.error),
      });
    }
    const { username, email, password, image, phone } = result.data;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedpassword,
        image: image || null,
        phone,
      },
    });
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return res.status(201).json({
      message: "User created sucessfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: z.treeifyError(result.error),
      });
    }
    const { email, password } = result.data;
    const exist_user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!exist_user) {
      return res.status(400).json({
        message: "No user exists. Please create new account.",
      });
    }
    const check_pass = await bcrypt.compare(password, exist_user.password);
    if (!check_pass) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { userId: exist_user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return res.status(200).json({
      message: "User logged in sucessfully",
      token,
      user: {
        id: exist_user.id,
        username: exist_user.username,
        email: exist_user.email,
        image: exist_user.image,
        phone:exist_user.phone
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
