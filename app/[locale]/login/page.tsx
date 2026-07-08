'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signIn, useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { Input, Divider } from '@/components/ui'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import Link from 'next/link'
import { gsap } from 'gsap'

/** Anchuras deterministas del código de barras decorativo. */
const BARCODE = [2, 1, 3, 1, 1, 4, 2, 1, 1, 3, 2, 4, 1, 1, 2, 3, 1, 2, 1, 4, 1, 2, 3, 1]

function LoginForm() {
    const t = useTranslations('auth.login')
    const tErrors = useTranslations('auth.login.errors')
    const router = useRouter()
    const locale = useLocale()
    const callbackUrl = `/${locale}/dashboard`
    const { status } = useSession()

    // Si ya tiene sesión, redirige al dashboard
    React.useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl)
        }
    }, [status, callbackUrl, router])

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [errors, setErrors] = React.useState<{
        email?: string
        password?: string
    }>({})
    const [isLoading, setIsLoading] = React.useState(false)
    const [serverError, setServerError] = React.useState<string>('')

    const rootRef = React.useRef<HTMLDivElement>(null)

    // Entrada: el titular sube por líneas recortadas y el recibo se "imprime"
    React.useEffect(() => {
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const ctx = gsap.context(() => {
                gsap.from('.tk-auth-line > *', {
                    yPercent: 110,
                    duration: 0.9,
                    ease: 'power4.out',
                    stagger: 0.09,
                })
                gsap.from('.tk-auth-meta', {
                    opacity: 0,
                    y: 14,
                    duration: 0.6,
                    delay: 0.35,
                    ease: 'power3.out',
                    stagger: 0.08,
                })
                gsap.from('.tk-auth-card', {
                    opacity: 0,
                    y: 46,
                    rotation: 1.6,
                    duration: 0.9,
                    delay: 0.2,
                    ease: 'power4.out',
                })
                gsap.from('.tk-auth-bar', {
                    scaleY: 0,
                    transformOrigin: 'bottom',
                    duration: 0.55,
                    delay: 0.5,
                    ease: 'power3.out',
                    stagger: 0.02,
                })
            }, rootRef)
            return () => ctx.revert()
        })
        return () => mm.revert()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === 'email') setEmail(value)
        if (name === 'password') setPassword(value)
        if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: '' })
        }
        if (serverError) {
            setServerError('')
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})
        setServerError('')
        setIsLoading(true)

        try {
            // Validate form data
            const validatedData = loginSchema.parse({ email, password })

            // Attempt sign in with redirect
            const result = await signIn('credentials', {
                email: validatedData.email,
                password: validatedData.password,
                redirect: false,
                callbackUrl,
            })

            if (!result?.ok || result?.error) {
                console.error('Login error:', result?.error)
                setServerError('invalidCredentials')
                setIsLoading(false)
                return
            }

            // Success - redirect using window.location for more reliable redirect
            window.location.href = callbackUrl
        } catch (error: any) {
            console.error('Login exception:', error)
            if (error.errors) {
                // Zod validation errors
                const fieldErrors: Partial<Record<keyof LoginInput, string>> =
                    {}
                error.errors.forEach((err: any) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof LoginInput] =
                            err.message
                    }
                })
                setErrors(fieldErrors)
            } else {
                setServerError('serverError')
            }
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn('google', { callbackUrl })
        } catch (error) {
            setServerError('serverError')
            setIsLoading(false)
        }
    }

    // Mostrar loader mientras verifica sesión
    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper">
                <p className="font-mono text-xs font-bold tracking-[0.4em] text-ink">
                    ▮▮▮<span className="tk-blink text-thermal">▮</span>
                </p>
            </div>
        )
    }

    return (
        <div
            ref={rootRef}
            className="tk-root tk-grain relative min-h-screen overflow-x-clip"
        >
            {/* Lomo vertical decorativo */}
            <p
                className="tk-vertical pointer-events-none absolute right-[2vw] top-32 hidden font-mono text-[10px] tracking-[0.5em] text-ash lg:block"
                aria-hidden="true"
            >
                TIKIT — {t('title').toUpperCase()} — Nº 0001
            </p>

            <div className="grid min-h-screen items-center gap-12 px-[4vw] pb-16 pt-28 lg:grid-cols-12 lg:gap-6">
                {/* Columna izquierda: titular de póster */}
                <div className="lg:col-span-6">
                    <p className="tk-auth-meta font-mono text-[10px] tracking-[0.4em] text-ash">
                        TIKIT / {new Date().getFullYear()} — DOC. 01
                    </p>

                    <h1 className="tk-display mt-6 text-[clamp(3rem,9vw,8.5rem)]">
                        <span className="tk-clip tk-auth-line">
                            <span>{t('title').split(' ')[0]}</span>
                        </span>
                        <span className="tk-clip tk-auth-line">
                            <span className="tk-outline">
                                {t('title').split(' ').slice(1).join(' ') || 'TIKIT'}
                                <span className="text-thermal [-webkit-text-stroke:0]">.</span>
                            </span>
                        </span>
                    </h1>

                    <p className="tk-auth-meta mt-6 max-w-md font-mono text-sm leading-relaxed text-ink-2">
                        {t('subtitle')}
                    </p>

                    {/* Código de barras decorativo */}
                    <div
                        className="mt-10 hidden h-14 items-stretch gap-[3px] lg:flex"
                        aria-hidden="true"
                    >
                        {BARCODE.map((w, i) => (
                            <span
                                key={i}
                                className="tk-auth-bar bg-ink"
                                style={{ width: `${w * 2}px` }}
                            />
                        ))}
                    </div>
                    <p className="tk-auth-meta mt-3 hidden font-mono text-[10px] tracking-[0.45em] text-ash lg:block">
                        8 411414 000001
                    </p>
                </div>

                {/* Columna derecha: el formulario es un recibo */}
                <div className="tk-auth-card lg:col-span-5 lg:col-start-8">
                    <div className="w-full font-mono [box-shadow:14px_18px_0_0_rgba(20, 27, 24,0.16)]">
                        <div className="tk-teeth tk-teeth-up [--tk-teeth-color:var(--color-receipt)]" />

                        <div className="bg-receipt px-6 py-8 sm:px-8">
                            {/* Cabecera del recibo */}
                            <p className="tk-condensed text-center text-2xl">
                                {t('title')}
                            </p>
                            <p className="mt-1 text-center text-[10px] tracking-[0.25em] text-ash">
                                {new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB')} — TIKIT
                            </p>

                            <div className="my-5 border-t-2 border-dashed border-ink/30" />

                            {/* Error del servidor */}
                            {serverError && (
                                <div className="mb-5 animate-shake border-2 border-danger px-3 py-2.5">
                                    <p className="text-xs font-bold tracking-wide text-danger">
                                        ▲ {tErrors(serverError)}
                                    </p>
                                </div>
                            )}

                            {/* Formulario */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    label={t('email')}
                                    name="email"
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    disabled={isLoading}
                                    required
                                />

                                <Input
                                    label={t('password')}
                                    name="password"
                                    type="password"
                                    placeholder={t('passwordPlaceholder')}
                                    value={password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    disabled={isLoading}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="tk-btn tk-btn-ink w-full"
                                >
                                    {isLoading ? (
                                        <span>
                                            {t('buttonLoading')}
                                            <span className="tk-blink">_</span>
                                        </span>
                                    ) : (
                                        <>
                                            {t('button')}
                                            <span aria-hidden="true">→</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <Divider text="•••" className="my-6" />

                            {/* Google */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="tk-btn tk-btn-ghost w-full"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {t('googleButton')}
                            </button>

                            <div className="my-5 border-t-2 border-dashed border-ink/30" />

                            {/* Pie del recibo */}
                            <p className="text-center text-xs text-ink-2">
                                {t('noAccount')}{' '}
                                <Link
                                    href={`/${locale}/register`}
                                    className="font-bold text-thermal underline decoration-2 underline-offset-4 transition-colors hover:text-ink"
                                >
                                    {t('registerLink')}
                                </Link>
                            </p>
                            <p className="mt-4 text-center text-[9px] tracking-[0.3em] text-ash">
                                ★ TIKIT ★
                            </p>
                        </div>

                        <div className="tk-teeth [--tk-teeth-color:var(--color-receipt)]" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-paper font-mono text-xs tracking-[0.3em] text-ink">
                    ...
                </div>
            }
        >
            <LoginForm />
        </React.Suspense>
    )
}
