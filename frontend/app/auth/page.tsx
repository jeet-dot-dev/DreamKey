"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import { loginSchema, signupSchema } from '@/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>



export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [selectedFileName, setSelectedFileName] = useState('No file chosen')
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [fileData, setFileData] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isLogin = activeTab === 'login'

  const submitLabel = useMemo(() => {
    return isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
  }, [isLogin])

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur"
  })

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      phone: "",
      image: ""
    },
    mode: "onBlur"
  })

  // Reset form when switching tabs
  useEffect(() => {
    if (isLogin) {
      loginForm.reset()
    } else {
      signupForm.reset()
      handleClearProfilePicture()
    }
  }, [isLogin, loginForm, signupForm])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl)
      }
      setProfilePreviewUrl(null)
      setSelectedFileName('No file chosen')
      setFileData(null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl)
    }

    setSelectedFileName(file.name)
    setFileData(file)
    const previewUrl = URL.createObjectURL(file)
    setProfilePreviewUrl(previewUrl)
  }

  const handleClearProfilePicture = () => {
    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl)
    }
    setProfilePreviewUrl(null)
    setSelectedFileName('No file chosen')
    setFileData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl)
      }
    }
  }, [profilePreviewUrl])

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const loadingToast = toast.loading('Signing in...')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      )
      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message || "Login failed. Please try again.", { id: loadingToast })
        return
      }

      toast.success('Login successful! Redirecting...', { id: loadingToast })
      localStorage.setItem("token", json.token)
      localStorage.setItem("user", JSON.stringify(json.user))
      document.cookie = `token=${json.token}; path=/; max-age=604800; Secure; SameSite=Strict`;
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.")
    }
  }

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      const toast_id = toast.loading('Creating account...')

      let imagePath = ""

      // Upload profile picture if provided
      if (fileData) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', fileData)

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload/upload-profile-picture`,
          {
            method: "POST",
            body: uploadFormData
          }
        )

        if (!uploadRes.ok) {
          toast.error("Failed to upload profile picture", { id: toast_id })
          return
        }

        const uploadJson = await uploadRes.json()
        imagePath = uploadJson.path
      }

      // Submit signup with image path
      const signupData = {
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        image: imagePath || ""
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData)
        }
      )

      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message || "Signup failed. Please try again.", { id: toast_id })
        return
      }

      toast.success('Account created successfully! Signing in...', { id: toast_id })
      localStorage.setItem("token", json.token)
      localStorage.setItem("user", JSON.stringify(json.user))
      document.cookie = `token=${json.token}; path=/; max-age=604800; Secure; SameSite=Strict`;
      
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      toast.dismiss()
      toast.error("Network error. Please check your connection and try again.")
    }
  }

  return (
    <main className="min-h-screen bg-[#060913]">
      <section className="grid min-h-screen w-full bg-[#070b14] lg:grid-cols-[1fr_1fr]">
        <div className="relative hidden min-h-130 border-b border-[#1c2230] lg:block lg:min-h-screen lg:border-b-0 lg:border-r lg:border-r-[#171d2a]">
            <Image
              src="/property.jpg"
              alt="Luxury property"
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,24,0.2)_0%,rgba(6,13,24,0.35)_40%,rgba(3,6,10,0.9)_100%)]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(47,132,255,0.24)_0%,rgba(8,13,22,0)_42%)]" />

            <div className="absolute left-7 top-7 z-10 sm:left-10 sm:top-10">
              <Image
                src="/logor1m.png"
                alt="DreamKey"
                width={180}
                height={80}
                className="h-auto w-37.5 sm:w-45"
              />
              <p className="mt-1 text-3xl font-semibold leading-none text-white sm:text-4xl">Dream Key</p>
              <p className="mt-2 text-[10px] font-semibold tracking-[0.24em] text-[#cba748] sm:text-[11px]">
                ARCHITECTURAL REAL ESTATE CRM
              </p>
            </div>

            <div className="absolute inset-x-7 bottom-8 z-10 sm:inset-x-10 sm:bottom-12">
              <h1 className="max-w-90 text-3xl font-semibold leading-tight text-white sm:text-5xl">
                Exclusivity is the only standard.
              </h1>
              <div className="mt-5 h-0.75 w-14 bg-[#d2ad43]" />
              <p className="mt-6 max-w-105 text-sm leading-7 text-[#d0d7e5] sm:text-[23px] sm:leading-10">
                Access the most sophisticated property management interface designed for the world&apos;s leading architectural agencies.
              </p>
            </div>
        </div>

        <div className="flex min-h-screen items-center justify-center bg-[#060913] px-6 py-10 sm:px-10 lg:min-h-screen lg:px-16">
          <div className="w-full max-w-105">
              <h2 className="text-3xl font-semibold text-[#edf1fa] sm:text-[34px]">Portal Access</h2>
              <p className="mt-3 text-sm text-[#9ba5b9] sm:text-base">
                Enter your credentials to manage your portfolio.
              </p>

              <div className="mt-8 grid h-14 grid-cols-2 overflow-hidden rounded-sm border border-[#202735] bg-[#111724]">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`text-sm transition-colors ${
                    isLogin
                      ? 'border-b-2 border-b-[#cbab4f] font-semibold text-[#e6c45f]'
                      : 'font-medium text-[#c0cadb] hover:text-[#dce3f0]'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`text-sm transition-colors ${
                    !isLogin
                      ? 'border-b-2 border-b-[#cbab4f] font-semibold text-[#e6c45f]'
                      : 'font-medium text-[#c0cadb] hover:text-[#dce3f0]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {isLogin ? (
                <form className="mt-9 space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      EMAIL ADDRESS
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${loginForm.formState.errors.email ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <Mail className="h-4 w-4" />
                      <input
                        type="email"
                        placeholder="agent@dreamkey.com"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="mt-2 text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      PASSWORD
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${loginForm.formState.errors.password ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <Lock className="h-4 w-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="........"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-[#9aa4ba] transition-colors hover:bg-[#2b3343] hover:text-[#e6edf9]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-2 text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[#9aa4ba]">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded-[2px] border border-[#374051] bg-transparent accent-[#d6b24d]"
                      />
                      Remember device
                    </label>
                    <button
                      type="button"
                      className="font-medium text-[#d6b24d] hover:text-[#e4c973]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="h-14 w-full bg-[#d8b246] text-sm font-bold tracking-[0.2em] text-[#13181f] transition-colors hover:bg-[#e4c15a] disabled:opacity-50"
                  >
                    {loginForm.formState.isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
                  </button>
                </form>
              ) : (
                <form className="mt-9 space-y-6" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      PROFILE PICTURE
                    </label>
                    <div className="flex h-13.5 items-center overflow-hidden rounded-sm border border-[#2a3140] bg-[#212631]">
                      <label
                        htmlFor="profile-picture"
                        className="inline-flex h-full cursor-pointer items-center px-4 text-xs font-semibold tracking-[0.08em] text-[#d6b24d] hover:bg-[#2b3343]"
                      >
                        CHOOSE FILE
                      </label>
                      <span className="truncate px-3 text-sm text-[#9aa4ba]">{selectedFileName}</span>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>

                    {profilePreviewUrl && (
                      <div className="mt-3 inline-flex items-center gap-3 rounded-md border border-[#2a3140] bg-[#131926] p-2 pr-1.5">
                        <Image
                          src={profilePreviewUrl}
                          alt="Selected profile preview"
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-md object-cover"
                          unoptimized
                        />
                        <span className="max-w-40 truncate text-xs text-[#9aa4ba]">Preview</span>
                        <button
                          type="button"
                          onClick={handleClearProfilePicture}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#9aa4ba] transition-colors hover:bg-[#2b3343] hover:text-[#e6edf9]"
                          aria-label="Clear selected profile image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      USERNAME
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${signupForm.formState.errors.username ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <User className="h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Johnatan_Doe"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...signupForm.register("username")}
                      />
                    </div>
                    {signupForm.formState.errors.username && (
                      <p className="mt-2 text-xs text-red-400">{signupForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      EMAIL ADDRESS
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${signupForm.formState.errors.email ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <Mail className="h-4 w-4" />
                      <input
                        type="email"
                        placeholder="agent@dreamkey.com"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...signupForm.register("email")}
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="mt-2 text-xs text-red-400">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      PHONE NUMBER
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${signupForm.formState.errors.phone ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <Mail className="h-4 w-4" />
                      <input
                        type="tel"
                        placeholder="1234567890"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...signupForm.register("phone")}
                      />
                    </div>
                    {signupForm.formState.errors.phone && (
                      <p className="mt-2 text-xs text-red-400">{signupForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] font-semibold tracking-[0.14em] text-[#d8ba62]">
                      PASSWORD
                    </label>
                    <div className={`flex h-13.5 items-center gap-3 rounded-sm border ${signupForm.formState.errors.password ? 'border-red-500' : 'border-[#2a3140]'} bg-[#212631] px-4 text-[#7f899d]`}>
                      <Lock className="h-4 w-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="........"
                        className="h-full w-full bg-transparent text-[15px] text-[#f2f5fb] placeholder:text-[#7f899d] focus:outline-none"
                        {...signupForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-[#9aa4ba] transition-colors hover:bg-[#2b3343] hover:text-[#e6edf9]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="mt-2 text-xs text-red-400">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="h-14 w-full bg-[#d8b246] text-sm font-bold tracking-[0.2em] text-[#13181f] transition-colors hover:bg-[#e4c15a] disabled:opacity-50"
                  >
                    {signupForm.formState.isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </button>
                </form>
              )}

              <p className="mt-12 text-center text-[10px] font-medium tracking-[0.14em] text-[#4b5468]">
                BY CONTINUING, YOU AGREE TO DREAMKEY&apos;S{' '}
                <button type="button" className="text-[#8f98ab] hover:text-[#aeb6c7]">
                  TERMS OF SERVICE
                </button>{' '}
                &{' '}
                <button type="button" className="text-[#8f98ab] hover:text-[#aeb6c7]">
                  PRIVACY POLICY
                </button>
              </p>
          </div>
        </div>
      </section>
    </main>
  )
}