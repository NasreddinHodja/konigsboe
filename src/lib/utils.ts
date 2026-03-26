export function youtubeId(url: string): string | null {
	// youtu.be/ID
	let m = url.match(/youtu\.be\/([^?&]+)/);
	if (m) return m[1];
	// youtube.com/watch?v=ID
	m = url.match(/youtube\.com\/watch\?.*v=([^&]+)/);
	if (m) return m[1];
	// already a thumbnail URL: img.youtube.com/vi/ID/...
	m = url.match(/img\.youtube\.com\/vi\/([^/]+)\//);
	if (m) return m[1];
	return null;
}

export function youtubeThumbnail(id: string): string {
	return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export function formatDate(d: string): string {
	return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export interface TocItem {
	id: string;
	text: string;
	level: number;
}

export function extractToc(html: string): TocItem[] {
	const items: TocItem[] = [];
	const re = /<h([1-6])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		const level = parseInt(m[1]);
		if (level > 3) continue; // only h1–h3
		items.push({ level, id: m[2], text: m[3].replace(/<[^>]*>/g, '') });
	}
	return items;
}
