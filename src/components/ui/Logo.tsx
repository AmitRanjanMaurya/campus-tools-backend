import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'full' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const iconSize = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 56
  }

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg`}>
      <svg
        width={iconSize[size] * 0.6}
        height={iconSize[size] * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {/* Campus building icon with tools */}
        <path
          d="M3 21V9l9-6 9 6v12H3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M9 21V12h6v9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.2"
        />
        {/* Tool icons overlay */}
        <circle cx="8" cy="8" r="1" fill="currentColor" />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
        <circle cx="16" cy="8" r="1" fill="currentColor" />
        <rect x="10" y="15" width="4" height="1" fill="currentColor" />
        <rect x="10" y="17" width="4" height="1" fill="currentColor" />
      </svg>
    </div>
  )

  const LogoText = () => (
    <div className="flex flex-col">
      <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        CampusToolsHub
      </span>
      {size !== 'sm' && (
        <span className="text-xs text-gray-500 -mt-1">
          Your Campus Productivity Hub
        </span>
      )}
    </div>
  )

  if (variant === 'icon') {
    return <LogoIcon />
  }

  if (variant === 'text') {
    return <LogoText />
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  )
}

export default Logo

// SVG Logo for use in metadata and external sources
export const LogoSVG = `
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Logo Icon -->
  <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#logoGradient)" />
  
  <!-- Campus building -->
  <path d="M15 45V25l10-6 10 6v20H15z" stroke="white" stroke-width="1.5" fill="none"/>
  <path d="M22 45V35h6v10" stroke="white" stroke-width="1.5" fill="white" fill-opacity="0.3"/>
  
  <!-- Tool icons -->
  <circle cx="20" cy="22" r="1" fill="white" />
  <circle cx="25" cy="20" r="1" fill="white" />
  <circle cx="30" cy="22" r="1" fill="white" />
  <rect x="23" y="38" width="4" height="1" fill="white" />
  <rect x="23" y="41" width="4" height="1" fill="white" />
  
  <!-- Text -->
  <text x="60" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="url(#logoGradient)">
    CampusToolsHub
  </text>
  <text x="60" y="45" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
    Your Campus Productivity Hub
  </text>
</svg>
`
