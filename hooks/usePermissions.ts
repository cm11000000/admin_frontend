import { useState, useEffect } from 'react'

export interface UserPermissions {
  viewUpdateRate: boolean
  cltActivate: boolean
  refundLnk: boolean
  vRateMapping: boolean
  userActivate: boolean
  tidRpt: boolean
  AnalysisRpt: boolean
  TSRRpt: boolean
  mnuSettlePaisa: boolean
  mnuPgReport: boolean
  cloneLnk: boolean
  showUploadFile: boolean
}

function getDefaultPermissions(): UserPermissions {
  return {
    viewUpdateRate: false,
    cltActivate: false,
    refundLnk: false,
    vRateMapping: false,
    userActivate: false,
    tidRpt: false,
    AnalysisRpt: false,
    TSRRpt: false,
    mnuSettlePaisa: false,
    mnuPgReport: false,
    cloneLnk: false,
    showUploadFile: false
  }
}

/**
 * Permission hook that replicates Angular's exact permission logic
 * Based on adminportalfrontend/src/app/super-admin-portal/super-admin-dash-board/super-admin-dash-board.component.ts
 */
export const usePermissions = (): UserPermissions => {
  const [permissions, setPermissions] = useState<UserPermissions>(getDefaultPermissions())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const userName = localStorage.getItem('userName')?.toLowerCase() || ''
    const rights = localStorage.getItem('rights') === '1'

    // Database-driven permissions take priority (Super Admin)
    if (rights) {
      setPermissions({
        viewUpdateRate: true,
        cltActivate: true,
        vRateMapping: false,
        refundLnk: true,
        userActivate: false,
        tidRpt: false,
        AnalysisRpt: false,
        TSRRpt: false,
        mnuSettlePaisa: false,
        mnuPgReport: false,
        cloneLnk: false,
        showUploadFile: false
      })
      return
    }

    // Username-based permissions (matching Angular exactly)
    const perms: UserPermissions = getDefaultPermissions()

    // Operations Team - Full Rate Mapping Access
    if (userName === 'bhabesh.jha@sabpaisa.in') {
      perms.viewUpdateRate = true
      perms.vRateMapping = true
      perms.userActivate = true
      perms.refundLnk = true
    } else if ([
      'abhas.kumar@sabpaisa.in',
      'sonu.kumar@sabpaisa.in',
      'kanchan.kumar@sabpaisa.in',
      'shruti.khanna@sabpaisa.in',
      'deblina.chakraborty@sabpaisa.in',
      'meenu.singh@sabpaisa.in',
      'pathikrit.dasgupta@sabpaisa.in',
      'finance@sabpaisa.in'
    ].includes(userName)) {
      perms.vRateMapping = true
      perms.userActivate = true
    } else if (userName === 'kritika.kumar@sabpaisa.in') {
      perms.vRateMapping = true
    } else if (userName === 'dharmesh.gandhi@icicibank.com') {
      perms.userActivate = true
    }

    // TID Report Access
    if (['brajesh.prasad@sabpaisa.in'].includes(userName)) {
      perms.tidRpt = true
    }

    // Analysis Report Access
    if (userName === 'admin@sabpaisa.in') {
      perms.AnalysisRpt = true
    }

    // TSR Report Access
    if ([
      'kanak.kumar@sabpaisa.in',
      'admin@sabpaisa.in',
      'amit.tyagi@sabpaisa.in',
      'vinayak.sridhar@sabpaisa.in',
      'nadeem.jairajpuri@sabpaisa.in',
      'pathikrit.dasgupta@sabpaisa.in',
      'gautam.banerjee@sabpaisa.in'
    ].includes(userName)) {
      perms.TSRRpt = true
    }

    // Settle Paisa Report Access
    if (userName === 'soma.sen@sabpaisa.in') {
      perms.mnuSettlePaisa = true
    }

    // PG Report Access
    if (['amit.tyagi@sabpaisa.in'].includes(userName)) {
      perms.mnuPgReport = true
    }

    // Refund Access
    if (['demo1', 'soma.sen@sabpaisa.in', 'abhas.kumar@sabpaisa.in'].includes(userName)) {
      perms.refundLnk = true
    }

    // Upload File Access
    if ([
      'admin@sabpaisa.in',
      'abhas.kumar@sabpaisa.in',
      'sonu.kumar@sabpaisa.in',
      'kanchan.kumar@sabpaisa.in'
    ].includes(userName)) {
      perms.showUploadFile = true
    }

    setPermissions(perms)
  }, [])

  return permissions
}

/**
 * Helper function to check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  permissions: UserPermissions,
  requiredPerms: (keyof UserPermissions)[]
): boolean => {
  return requiredPerms.some(perm => permissions[perm])
}

/**
 * Helper function to check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  permissions: UserPermissions,
  requiredPerms: (keyof UserPermissions)[]
): boolean => {
  return requiredPerms.every(perm => permissions[perm])
}
