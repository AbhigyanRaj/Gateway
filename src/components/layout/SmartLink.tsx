import { Link } from 'react-router'

/**
 * Internal paths ("/apis#marathon") render a router <Link>; absolute URLs
 * render an <a> that opens in a new tab, with a screen-reader hint.
 */
export function SmartLink({
  href,
  children,
  ...props
}: Omit<React.ComponentProps<'a'>, 'href'> & { href: string }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
