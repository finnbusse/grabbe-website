"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  animation?: "fade-in-up" | "fade-in" | "slide-in-left" | "slide-in-right" | "scale-in"
  delay?: number
  threshold?: number
}

export function AnimateOnScroll({
  children,
  className = "",
  animation = "fade-in-up",
  delay = 0,
  threshold = 0.1,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  const animationClass = isVisible ? `animate-${animation}` : "opacity-0"

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={{ animationDelay: isVisible ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  )
}
