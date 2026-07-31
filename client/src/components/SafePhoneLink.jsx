import React, { useCallback } from 'react';
import { Phone } from 'lucide-react';
import { dialPhone, maskPhone, resolveDigits } from '../utils/phoneProtect';

/**
 * Shows a masked / label-only phone. Real digits are sent to the dial pad
 * only when the user taps to call — never as a static tel: href in HTML.
 */
const SafePhoneLink = ({
  phone,
  label,
  className = '',
  showIcon = false,
  iconSize = 14,
  children,
  as: Comp = 'button',
  ...rest
}) => {
  const digits = resolveDigits(phone);
  const display = children || label || maskPhone(phone);

  const onCall = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dialPhone(digits || phone);
    },
    [digits, phone]
  );

  const shared = {
    className,
    onClick: onCall,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dialPhone(digits || phone);
      }
    },
    title: 'Tap to call — number opens in dial pad only',
    'aria-label': typeof display === 'string' ? `Call ${display}` : 'Call hospital',
    ...rest,
  };

  const inner = (
    <>
      {showIcon && <Phone size={iconSize} className="shrink-0" aria-hidden />}
      {display}
    </>
  );

  if (Comp === 'a') {
    return (
      <a href="#call" role="link" {...shared}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" {...shared}>
      {inner}
    </button>
  );
};

export default SafePhoneLink;
