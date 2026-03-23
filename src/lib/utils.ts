import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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
