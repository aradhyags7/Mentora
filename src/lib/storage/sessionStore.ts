/**
 * MENTORA DYNAMIC SESSION STORE
 * 
 * Persists and retrieves dynamic student lessons and chat history in localStorage.
 * Ensures zero dependency on static pre-loaded fixtures while retaining real user sessions.
 */

export interface RecentLessonRecord {
  id: string;
  semanticKey: string;
  title: string;
  domain: string;
  timestamp: number;
}

const STORAGE_KEY = 'mentora_recent_lessons';

export class SessionStore {
  static getRecentLessons(): RecentLessonRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static addLesson(lesson: Omit<RecentLessonRecord, 'timestamp'>): RecentLessonRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const current = this.getRecentLessons();
      const filtered = current.filter(
        item => item.title.toLowerCase() !== lesson.title.toLowerCase()
      );
      const updated: RecentLessonRecord[] = [
        { ...lesson, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 30);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}
