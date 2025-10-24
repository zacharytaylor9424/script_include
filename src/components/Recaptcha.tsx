"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaProps {
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

export interface RecaptchaRef {
  reset: () => void;
  execute: () => void;
  getValue: () => string | null;
}

const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
      getValue: () => {
        return recaptchaRef.current?.getValue() || null;
      },
    }));

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.warn("reCAPTCHA site key not found. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.");
      return null;
    }

    return (
			<ReCAPTCHA
				ref={recaptchaRef}
				sitekey={siteKey}
				onChange={onChange}
				onExpired={onExpired}
				onError={onError}
				size="invisible"
			/>
		);
  }
);

Recaptcha.displayName = "Recaptcha";

export default Recaptcha;
