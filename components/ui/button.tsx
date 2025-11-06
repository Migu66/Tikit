'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      onMouseEnter,
      onMouseLeave,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const innerRef = ref || buttonRef;

    // Configuración de estilos según la variante
    // Solo aplicar variantStyles si el className no contiene clases de background o gradient
    const hasCustomBackground = props.className?.includes('bg-') || props.className?.includes('linear-to');
    const variantStyles = {
      primary:
        'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
      secondary:
        'bg-gray-200 hover:bg-gray-300 text-gray-900',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    };

    // Animación de entrada suave
    useEffect(() => {
      if (innerRef && 'current' in innerRef) {
        gsap.from(innerRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.4,
          ease: 'back.out',
        });
      }
    }, [innerRef]);

    // Animación en hover
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (innerRef && 'current' in innerRef && !disabled && !isLoading) {
        gsap.to(innerRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      onMouseEnter?.(e);
    };

    // Animación al salir del hover
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (innerRef && 'current' in innerRef && !disabled && !isLoading) {
        gsap.to(innerRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      onMouseLeave?.(e);
    };

    // Animación al hacer click
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (innerRef && 'current' in innerRef && !disabled && !isLoading) {
        const button = innerRef.current;

        // Animación de pulso
        gsap.timeline()
          .to(
            button,
            {
              scale: 0.95,
              duration: 0.1,
              ease: 'power2.in',
            },
            0
          )
          .to(
            button,
            {
              scale: 1.05,
              duration: 0.3,
              ease: 'elastic.out(1, 0.5)',
            },
            0.1
          );
      }
      onClick?.(e);
    };

    return (
      <button
        ref={innerRef}
        disabled={disabled || isLoading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`relative font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg ${!hasCustomBackground ? variantStyles[variant] : ''} ${sizeStyles[size]} ${props.className || ''}`}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {children}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
