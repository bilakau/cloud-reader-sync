export interface ComicListItem {
  title: string;
  slug: string;
  image?: string;
  type?: string;
  color?: string;
  rating?: string;
  chapters?: ChapterPreview[];
  latestChapter?: string;
  chapter?: string;
}

export interface ChapterPreview {
  title: string;
  slug: string;
  date?: string;
}

export interface PopularComic {
  rank: string;
  title: string;
  slug: string;
  author?: string;
  rating?: string;
  image?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  nextPage?: number | null;
}

export interface LatestResponse {
  success: boolean;
  pagination: Pagination;
  komikList: ComicListItem[];
  komikPopuler?: PopularComic[];
}

export interface SearchResponse {
  success: boolean;
  query?: string;
  pagination: Pagination;
  komikList: ComicListItem[];
}

export interface LibraryResponse {
  success: boolean;
  pagination: Pagination;
  komikList: ComicListItem[];
  komikPopuler?: PopularComic[];
}

export interface ComicDetail {
  id?: string;
  title: string;
  image: string;
  rating?: string;
  votes?: string;
  detail?: {
    alternativeTitle?: string;
    status?: string;
    author?: string;
    illustrator?: string;
    type?: string;
    theme?: string;
  };
  genres?: { name: string; slug: string }[];
  synopsis?: string;
  chapters?: { title: string; slug: string }[];
}

export interface DetailResponse {
  success: boolean;
  data: ComicDetail;
}

export interface ChapterImage {
  id: number;
  url: string;
}

export interface ChapterData {
  images: ChapterImage[];
  thumbnail?: { url: string; title: string };
  komikInfo?: {
    title: string;
    description?: string;
    chapters?: { title: string; slug: string }[];
  };
  navigation?: {
    prev?: string | null;
    next?: string | null;
  };
}

export interface ChapterResponse {
  success: boolean;
  data: ChapterData;
}

export interface HistoryItem {
  slug: string;
  title: string;
  image?: string;
  lastChapterSlug?: string;
  lastChapterTitle?: string;
  timestamp?: number;
}

export interface BookmarkItem {
  slug: string;
  title: string;
  image?: string;
}
