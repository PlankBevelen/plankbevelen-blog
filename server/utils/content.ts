export function normalizeUploadsInContent(content: string) {
  return String(content || '')
    .replace(/\]\(uploads\\/g, '](/uploads/')
    .replace(/\]\(uploads\//g, '](/uploads/')
    .replace(/src="uploads\\/g, 'src="/uploads/')
    .replace(/src="uploads\//g, 'src="/uploads/')
}

