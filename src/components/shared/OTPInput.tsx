import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  ClipboardEvent,
  KeyboardEvent,
} from 'react';

interface OTPInputProps {
  onComplete: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export interface OTPInputHandle {
  reset: () => void;
}

const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(
  ({ onComplete, error = false, disabled = false }, ref) => {
    const [values, setValues] = useState<string[]>(Array(6).fill(''));
    const [shake, setShake] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

    useImperativeHandle(ref, () => ({
      reset() {
        setValues(Array(6).fill(''));
        setShake(false);
        inputRefs.current[0]?.focus();
      },
    }));

    // Trigger shake animation when error prop becomes true
    React.useEffect(() => {
      if (error) {
        setShake(true);
        const timer = setTimeout(() => setShake(false), 350);
        return () => clearTimeout(timer);
      }
    }, [error]);

    const handleChange = (index: number, val: string) => {
      const digit = val.replace(/\D/g, '').slice(-1);
      const next = [...values];
      next[index] = digit;
      setValues(next);

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (next.every((v) => v !== '')) {
        onComplete(next.join(''));
      }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;

      const next = [...values];
      pasted.split('').forEach((char, i) => {
        next[i] = char;
      });
      setValues(next);

      const lastFilled = Math.min(pasted.length, 5);
      inputRefs.current[lastFilled]?.focus();

      if (next.every((v) => v !== '')) {
        onComplete(next.join(''));
      }
    };

    return (
      <>
        <style>{`
          @keyframes otp-shake {
            0%   { transform: translateX(0); }
            20%  { transform: translateX(-4px); }
            40%  { transform: translateX(4px); }
            60%  { transform: translateX(-4px); }
            80%  { transform: translateX(4px); }
            100% { transform: translateX(0); }
          }
          .otp-shake {
            animation: otp-shake 350ms ease-in-out;
          }
        `}</style>
        <div
          style={{
            display: 'flex',
            gap: '8px',
          }}
          className={shake ? 'otp-shake' : ''}
        >
          {values.map((val, index) => {
            const isFilled = val !== '';
            const borderColor = error ? '#C0392B' : isFilled ? '#1B6B44' : '#D1D5DB';
            const background = error ? '#FEF2F2' : '#FFFFFF';

            return (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                disabled={disabled}
                aria-label={`Chiffre ${index + 1} sur 6`}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: '46px',
                  height: '58px',
                  borderRadius: '14px',
                  border: `2px solid ${borderColor}`,
                  background,
                  textAlign: 'center',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#1F2937',
                  outline: 'none',
                  cursor: disabled ? 'not-allowed' : 'text',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'border-color 0.15s, background 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderWidth = '2.5px';
                  e.target.style.borderColor = error ? '#C0392B' : '#1B6B44';
                  e.target.style.background = error ? '#FEF2F2' : '#E3F5EC';
                }}
                onBlur={(e) => {
                  e.target.style.borderWidth = '2px';
                  e.target.style.borderColor = error
                    ? '#C0392B'
                    : val
                    ? '#1B6B44'
                    : '#D1D5DB';
                  e.target.style.background = error ? '#FEF2F2' : '#FFFFFF';
                }}
              />
            );
          })}
        </div>
      </>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export default OTPInput;
