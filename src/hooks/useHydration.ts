import { useEffect } from 'react';

export function useHydration() {
  useEffect(() => {
    // Add hydration marker to root element
    document.documentElement.setAttribute('data-hydrated', 'true');
    
    return () => {
      document.documentElement.removeAttribute('data-hydrated');
    };
  }, []);
}

export function useFormMounting(formRef: React.RefObject<HTMLFormElement>) {
  useEffect(() => {
    if (formRef.current) {
      formRef.current.setAttribute('data-mounted', 'true');
    }
  }, [formRef]);
} 