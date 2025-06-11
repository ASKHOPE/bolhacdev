import React, { useEffect } from 'react'
import { usePageBackground } from '../hooks/usePageBackground'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const { background } = usePageBackground()
  
  useEffect(() => {
    // Apply the background color to the body if provided
    if (background) {
      document.documentElement.style.setProperty('--page-background', background)
      document.body.classList.add('has-page-background')
    } else {
      document.documentElement.style.removeProperty('--page-background')
      document.body.classList.remove('has-page-background')
    }
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--page-background')
      document.body.classList.remove('has-page-background')
    }
  }, [background])

  return <>{children}</>
}