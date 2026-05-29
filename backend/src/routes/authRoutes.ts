import express from 'express'
import {signup,login} from '../controllers/authController.js'

const authRoutes = express.Router()

authRoutes.post("/login",login)
authRoutes.post("/signup",signup)

export default authRoutes;