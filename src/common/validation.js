const DEFAULT_PAGE_SIZE = 20;

export function requireFields(payload, fields, context = 'payload') {
  const missing = fields.filter((field) => payload?.[field] === undefined || payload?.[field] === null);
  if (missing.length) {
    throw new Error(`Missing required fields in ${context}: ${missing.join(', ')}`);
  }
}

export function sanitizeString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

export function paginate(items, options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(options.pageSize) || DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    total: items.length,
    items: items.slice(offset, offset + pageSize),
  };
}

export function clone(value) {
  return structuredClone(value);
}
