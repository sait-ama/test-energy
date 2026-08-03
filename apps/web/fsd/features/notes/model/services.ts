//todo
import { logger } from '~shared/lib/logger';

interface INote {
  label: string;
  note: string;
}

interface IChapterNote extends INote {
  chapterId: number;
}

interface INoteStorage {
  saveMainNote(note: INote): void;
  getMainNote(): INote | null;
  saveChapterNote(chapterId: number, note: IChapterNote): void;
  getChapterNoteById(chapterId: number): IChapterNote | null;
  getAllChapterNotes(): Record<string, IChapterNote>;
  removeChapterNoteById(chapterId: number): void;
  removeMainNote(): void;
  getAllNotes(): any;
}

export class NoteStorage implements INoteStorage {
  private data: {
    main: INote;
    chapters: Record<string, IChapterNote>;
  };

  constructor(initialData: string | null = null) {
    this.data = {
      main: {
        label: '',
        note: '',
      },
      chapters: {},
    };

    if (initialData) {
      const parsed = this.parseNote(initialData);
      if (parsed) {
        this.data = parsed;
      }
      if (!parsed?.main) {
        this.data.main = { label: 'Без названия', note: '' };
      }
      if (!parsed?.chapters) {
        this.data.chapters = {};
      }
    }
  }

  private parseNote(noteString: string): { main: any; chapters: any } | null {
    if (!noteString) return null;
    try {
      return JSON.parse(noteString);
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  public stringifyData(): string {
    try {
      return JSON.stringify(this.data);
    } catch (e) {
      logger.error(e);
      return '{}';
    }
  }

  saveMainNote(note: INote): void {
    this.data.main = note;
  }

  getMainNote(): INote | null {
    return this.data.main;
  }

  saveChapterNote(chapterId: number, note: IChapterNote): void {
    this.data.chapters[chapterId] = note;
  }

  getChapterNoteById(chapterId: number): IChapterNote | null {
    return this.data.chapters[chapterId] || null;
  }

  getAllNotes() {
    return this.data;
  }

  getAllChapterNotes(): Record<string, IChapterNote> {
    return this.data.chapters;
  }

  removeChapterNoteById(chapterId: number): void {
    delete this.data.chapters[chapterId];
  }

  removeMainNote(): void {
    if (this.data.main) {
      this.data.main.note = '';
    }
  }
}

export class NoteService {
  private storage: INoteStorage;

  constructor(storage: INoteStorage) {
    this.storage = storage;
  }

  setMainNoteLabelAndContent(label: string, note: string): void {
    const mainNote: INote = { label, note };
    this.storage.saveMainNote(mainNote);
  }

  getMainNote(): INote | null {
    return this.storage.getMainNote();
  }

  setChapterNote(chapterId: number, label: string, note: string): void {
    const chapterNote: IChapterNote = { chapterId, label, note };
    this.storage.saveChapterNote(chapterId, chapterNote);
  }

  getChapterNoteById(chapterId: number): IChapterNote | null {
    return this.storage.getChapterNoteById(chapterId);
  }

  removeChapterNoteById(chapterId: number): void {
    this.storage.removeChapterNoteById(chapterId);
  }

  removeMainNote(): void {
    this.storage.removeMainNote();
  }

  getAllChapterNotes(): Record<string, IChapterNote> {
    return this.storage.getAllChapterNotes();
  }

  getAllNotes(): Record<string, any> {
    return this.storage.getAllNotes();
  }
}

export class AsyncNoteManager {
  private noteService: NoteService;

  constructor(noteService: NoteService) {
    this.noteService = noteService;
  }

  public updateNotePrepare(
    formData: { chapters: Record<string, IChapterNote>; main: string | undefined },
    noteLabel = ''
  ): string {
    if (formData.main !== undefined) {
      this.noteService.setMainNoteLabelAndContent(noteLabel || 'Основная заметка', formData.main);
    }

    if (formData.chapters) {
      for (const [chapterId, note] of Object.entries(formData.chapters)) {
        this.noteService.setChapterNote(Number(chapterId), noteLabel, note);
      }
    }
    return JSON.stringify(this.noteService.getAllNotes());
  }

  public removeMainNotePrepare(): string {
    this.noteService.setMainNoteLabelAndContent('Основная заметка', '');
    return JSON.stringify(this.noteService.getAllNotes());
  }

  public removeNoteByIdPrepare(chapterId: number): string {
    this.noteService.removeChapterNoteById(chapterId);
    return JSON.stringify(this.noteService.getAllNotes());
  }
}
