interface BrandLogoProps {
  className?: string
  showText?: boolean
}

export function BrandLogo({ className, showText = true }: BrandLogoProps) {
  return (
    <div className={`brand-logo ${className ?? ''}`.trim()} aria-label="LeadFlow">
      <svg className="brand-logo-mark" viewBox="0 0 64 64" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="leadflowDrop" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8EC9FF" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path
          d="M32 4C22 18 12 28 12 40a20 20 0 0 0 40 0C52 28 42 18 32 4z"
          fill="url(#leadflowDrop)"
        />
        <path d="M20 39c0-8 7-14 15-14 4 0 8 1 11 4a16 16 0 0 0-27 10z" fill="#1D4ED8" opacity="0.95" />
        <circle cx="40" cy="42" r="4.3" fill="#fff" opacity="0.95" />
      </svg>

      {showText ? <span className="brand-logo-text">LeadFlow</span> : null}
    </div>
  )
}
