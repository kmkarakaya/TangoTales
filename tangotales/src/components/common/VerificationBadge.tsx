import React from 'react';

export type VerificationStatus = 'verified' | 'warning' | 'error' | 'pending' | 'unverified';

export interface VerificationBadgeProps {
  status: VerificationStatus;
  message?: string;
  tooltip?: string;
  compact?: boolean;
}

const statusConfig = {
  verified: {
    icon: '✓',
    label: 'Verified',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  warning: {
    icon: '⚠',
    label: 'Warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
  },
  error: {
    icon: '✕',
    label: 'Error',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
  pending: {
    icon: '⏳',
    label: 'Checking...',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  unverified: {
    icon: '?',
    label: 'Unverified',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
  },
};

/**
 * VerificationBadge - Displays link validation status with visual indicators
 * 
 * Usage:
 * - verified: Link validated successfully (HTTP 200, content matches metadata)
 * - warning: Link works but has issues (redirect, metadata mismatch, slow response)
 * - error: Link broken (404, timeout, invalid URL)
 * - pending: Validation in progress
 * - unverified: Link not yet validated
 */
export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  message,
  tooltip,
  compact = false,
}) => {
  const config = statusConfig[status];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${config.bgColor} ${config.textColor} text-xs font-bold border ${config.borderColor}`}
        title={tooltip || message || config.label}
        aria-label={tooltip || message || config.label}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${config.bgColor} ${config.textColor} text-xs font-medium border ${config.borderColor}`}
      title={tooltip}
      aria-label={tooltip || message || config.label}
    >
      <span className="font-bold">{config.icon}</span>
      {message || config.label}
    </span>
  );
};

export default VerificationBadge;
