import { SongDetailed } from "ytmusic-api";

export const recentSongID = new Set<string>();
export function addRecentSongID(id: string) {
  recentSongID.add(id);
  setTimeout(() => {
    recentSongID.delete(id);
  }, 30 * 1000 * 60);
}
export const searchQueryCache = new Map<string, SongDetailed[]>();
export const recentCoverImages = new Set<string>();
export function addRecentCoverImage(url: string) {
  recentCoverImages.add(url);
  setTimeout(() => {
    recentCoverImages.delete(url);
  }, 30 * 1000 * 60);
}
export const bufferCache = new Map<string, Buffer>();
