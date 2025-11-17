import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true, // Necesario para Vercel y otras plataformas
    secret: process.env.AUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `${
                process.env.NODE_ENV === 'production' ? '__Secure-' : ''
            }next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: null, // No guardar la imagen de Google
                }
            },
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                })

                if (!user) {
                    throw new Error('No user found with this email')
                }

                if (!user.password) {
                    throw new Error(
                        'This account was created with OAuth. Please use Google sign in'
                    )
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Password is incorrect')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],
    pages: {
        signIn: '/es/login',
        newUser: '/es/register',
        error: '/es/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.sub || ''
                session.user.name = token.name as string | null
                session.user.email = token.email as string
                session.user.image = token.picture as string | null
                session.user.provider = token.provider as string
            }
            return session
        },
        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                token.sub = user.id
                token.name = user.name
                token.email = user.email
                token.picture = user.image
            }
            if (account) {
                token.provider = account.provider
            }

            // Manejar actualización de sesión
            if (trigger === 'update' && session) {
                token.name = session.name ?? token.name
                token.email = session.email ?? token.email
                token.picture = session.image ?? token.picture
            }

            return token
        },
        async signIn({ user, account, profile }) {
            // Para OAuth providers (Google), crear o actualizar el usuario
            if (account?.provider === 'google' && profile?.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: profile.email },
                    })

                    if (!existingUser) {
                        // Crear nuevo usuario
                        await prisma.user.create({
                            data: {
                                email: profile.email,
                                name: profile.name || null,
                                image: null,
                            },
                        })
                    }
                } catch (error) {
                    console.error('Error creating user:', error)
                    return false
                }
            }
            return true
        },
    },
    events: {
        async signIn({ user, account }) {
            console.log('User signed in:', {
                userId: user?.id,
                email: user?.email,
                provider: account?.provider,
            })
        },
    },
    debug: process.env.NODE_ENV === 'development',
})

export type { Session } from 'next-auth'
