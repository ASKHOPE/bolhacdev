import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { MaintenancePage } from './MaintenancePage'

interface MaintenanceWrapperProps {
  children: React.ReactNode
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const location = useLocation()
  const { isPageInMaintenance, maintenance } = useTheme()
  const { isAdmin } = useAuth()

  const shouldShowMaintenance = isPageInMaintenance(location.pathname)
  const canBypass = maintenance.allowAdminAccess && isAdmin

  if (shouldShowMaintenance && !canBypass) {
    return <MaintenancePage allowAdminBypass={maintenance.allowAdminAccess} />
  }

  return <>{children}</>
}