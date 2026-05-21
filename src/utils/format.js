export const formatDate = (value, options = {}) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const formatPrice = (amount) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);

export const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

export const unwrapList = (data) => (Array.isArray(data) ? data : data?.items ?? []);
