"use client";

import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

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

const RecaptchaInner = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const executeRecaptchaAction = useCallback(async () => {
      if (!executeRecaptcha) {
        console.warn("reCAPTCHA not available");
        return;
      }

      try {
        const token = await executeRecaptcha("submit");
        onChange?.(token);
      } catch (error) {
        console.error("reCAPTCHA execution error:", error);
        onError?.();
      }
    }, [executeRecaptcha, onChange, onError]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        // For v3, we don't need to reset anything - just do nothing
        // The reset method is called after successful operations to clean up
      },
      execute: () => {
        executeRecaptchaAction();
      },
      getValue: () => {
        // For v3, we don't store the value, it's passed to onChange
        return null;
      },
    }));

    return null; // v3 is invisible, no UI component needed
  }
);

RecaptchaInner.displayName = "RecaptchaInner";

const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  (props, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.warn("reCAPTCHA site key not found. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.");
      return null;
    }

    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={siteKey}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: "head",
          nonce: undefined,
        }}
      >
        <RecaptchaInner ref={ref} {...props} />
      </GoogleReCaptchaProvider>
    );
  }
);

Recaptcha.displayName = "Recaptcha";

export default Recaptcha;
