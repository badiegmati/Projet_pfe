export default function AnimatedCard({
  children,
  className = '',
  delay = 0,
  onClick,
  glass = false,
  neon = false,
  style = {},
}) {
  return (
    <div
      className={`${glass ? 'card-glass' : 'card'} card-animate
        ${neon ? 'badge-critique' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
      style={{ animationDelay: `${delay}ms`, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}