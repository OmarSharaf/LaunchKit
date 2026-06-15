import Image from 'next/image'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME } from '@/lib/site'

interface BrandLogoProps {
  href?: string
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { box: 'h-7 w-7', icon: 'h-4 w-4', text: 'text-base', img: 28 },
  md: { box: 'h-8 w-8', icon: 'h-5 w-5', text: 'text-lg', img: 32 },
  lg: { box: 'h-10 w-10', icon: 'h-6 w-6', text: 'text-xl', img: 40 },
}

export function BrandLogo({
  href = '/',
  className,
  showText = true,
  size = 'md',
}: BrandLogoProps) {
  const sizes = sizeMap[size]

  const icon = APP_LOGO_URL ? (
    <Image
      src={APP_LOGO_URL}
      alt=""
      width={sizes.img}
      height={sizes.img}
      className={cn('rounded-lg object-contain', sizes.box)}
      unoptimized
    />
  ) : (
    <span
      className={cn(
        'flex items-center justify-center rounded-lg bg-primary/10',
        sizes.box
      )}
    >
      <Zap className={cn(sizes.icon, 'text-primary')} aria-hidden />
    </span>
  )

  const content = (
    <>
      {icon}
      {showText && (
        <span className={cn('font-semibold tracking-tight', sizes.text)}>
          {APP_NAME}
        </span>
      )}
    </>
  )

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 transition-opacity hover:opacity-90',
        className
      )}
    >
      {content}
    </Link>
  )
}
