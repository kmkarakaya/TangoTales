import React from 'react';
import { useLinkValidation, UseLinkValidationOptions } from '../../hooks/useLinkValidation';
import { VerificationBadge } from './VerificationBadge';

export interface VerifiedLinkProps extends UseLinkValidationOptions {
  href: string;
  children: React.ReactNode;
  className?: string;
  showBadge?: boolean;
  badgePosition?: 'before' | 'after' | 'inline';
  target?: string;
  rel?: string;
}

/**
 * VerifiedLink - A link component with automatic validation and verification badge
 * 
 * Usage:
 * ```tsx
 * <VerifiedLink
 *   href="https://youtube.com/watch?v=abc123"
 *   metadata={{ artist: 'Juan D\'Arienzo', title: 'La Cumparsita' }}
 *   showBadge={true}
 *   badgePosition="inline"
 * >
 *   Watch on YouTube
 * </VerifiedLink>
 * ```
 */
export const VerifiedLink: React.FC<VerifiedLinkProps> = ({
  href,
  children,
  className = '',
  showBadge = true,
  badgePosition = 'inline',
  target = '_blank',
  rel = 'noopener noreferrer',
  enabled = true,
  metadata,
  debounceMs,
}) => {
  const { status, message, tooltip } = useLinkValidation(href, {
    enabled,
    metadata,
    debounceMs,
  });

  const badge = showBadge && (
    <VerificationBadge
      status={status}
      message={message}
      tooltip={tooltip}
      compact={badgePosition === 'inline'}
    />
  );

  return (
    <span className="inline-flex items-center gap-2">
      {badgePosition === 'before' && badge}
      <a
        href={href}
        target={target}
        rel={rel}
        className={`text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      >
        {children}
        {badgePosition === 'inline' && showBadge && (
          <span className="ml-1">{badge}</span>
        )}
      </a>
      {badgePosition === 'after' && badge}
    </span>
  );
};

export default VerifiedLink;
