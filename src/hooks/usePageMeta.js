import { useEffect } from 'react';

export function usePageMeta({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Subscription Portal` : 'Subscription Portal';
    document.title = fullTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    if (description) meta.content = description;
  }, [title, description]);
}
