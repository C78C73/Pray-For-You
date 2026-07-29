import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/useAppStore';
import { BIBLE_BOOKS } from '../data/bibleBooks';
import { BIBLE_VERSIONS, BibleVersionId, fetchPassage } from '../services/bibleService';
import { BibleVerse } from '../types';
import { todayKey } from '../utils/date';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../theme/theme';

type ReaderView = 'books' | 'chapters' | 'reader';

export function BibleReader() {
  const { colors, spacing, radius, typography, cardShadow, scheme } = useTheme();
  const styles = useMemo(
    () => makeStyles(colors, spacing, radius, cardShadow, scheme),
    [colors, spacing, radius, cardShadow, scheme]
  );

  const user = useAppStore((s) => s.user)!;
  const recordBibleReadToday = useAppStore((s) => s.recordBibleReadToday);
  const highlightedVerses = useAppStore((s) => s.highlightedVerses);
  const toggleHighlight = useAppStore((s) => s.toggleHighlight);

  const [view, setView] = useState<ReaderView>('books');
  const [search, setSearch] = useState('');
  const [bookName, setBookName] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [version, setVersion] = useState<BibleVersionId>('web');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const book = BIBLE_BOOKS.find((b) => b.name === bookName) ?? null;
  const bookIndex = book ? BIBLE_BOOKS.findIndex((b) => b.name === book.name) : -1;
  const isFirstChapterOfBible = !book || (bookIndex === 0 && chapter === 1);
  const isLastChapterOfBible = !book || (bookIndex === BIBLE_BOOKS.length - 1 && chapter === book.chapters);
  const readToday = user.streak.lastActiveDate === todayKey();

  useEffect(() => {
    if (view !== 'reader' || !book || !chapter) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchPassage(`${book.name} ${chapter}`, version).then((v) => {
      if (cancelled) return;
      setLoading(false);
      if (v.length === 0) setFailed(true);
      else setVerses(v);
    });
    return () => {
      cancelled = true;
    };
  }, [view, book, chapter, version]);

  function openBook(name: string) {
    setBookName(name);
    setView('chapters');
  }

  function openChapter(n: number) {
    setChapter(n);
    setView('reader');
  }

  function changeChapter(delta: number) {
    if (!book || !chapter) return;
    const next = chapter + delta;
    if (next >= 1 && next <= book.chapters) {
      setChapter(next);
      return;
    }
    const bookIndex = BIBLE_BOOKS.findIndex((b) => b.name === book.name);
    if (delta > 0) {
      const nextBook = BIBLE_BOOKS[bookIndex + 1];
      if (!nextBook) return; // Revelation 22 — end of the Bible
      setBookName(nextBook.name);
      setChapter(1);
    } else {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      if (!prevBook) return; // Genesis 1 — start of the Bible
      setBookName(prevBook.name);
      setChapter(prevBook.chapters);
    }
  }

  const filteredBooks = BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));
  const oldTestament = filteredBooks.filter((b) => b.testament === 'old');
  const newTestament = filteredBooks.filter((b) => b.testament === 'new');

  const versionRow = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.versionRow}>
      {BIBLE_VERSIONS.map((v) => (
        <Pressable
          key={v.id}
          onPress={() => setVersion(v.id)}
          style={[styles.versionChip, version === v.id && styles.versionChipActive]}
        >
          <Text style={[styles.versionChipLabel, version === v.id && styles.versionChipLabelActive]}>
            {v.id.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  if (view === 'books') {
    return (
      <View style={styles.wrap}>
        {versionRow}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search books..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
        <ScrollView contentContainerStyle={styles.scrollPad}>
          {oldTestament.length > 0 && (
            <>
              <Text style={[typography.heading, styles.sectionTitle]}>Old Testament</Text>
              <View style={styles.bookGrid}>
                {oldTestament.map((b) => (
                  <Pressable key={b.name} onPress={() => openBook(b.name)} style={styles.bookChip}>
                    <Text style={styles.bookChipLabel}>{b.name}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {newTestament.length > 0 && (
            <>
              <Text style={[typography.heading, styles.sectionTitle]}>New Testament</Text>
              <View style={styles.bookGrid}>
                {newTestament.map((b) => (
                  <Pressable key={b.name} onPress={() => openBook(b.name)} style={styles.bookChip}>
                    <Text style={styles.bookChipLabel}>{b.name}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {filteredBooks.length === 0 && <Text style={typography.caption}>No books match "{search}".</Text>}
        </ScrollView>
      </View>
    );
  }

  if (view === 'chapters' && book) {
    return (
      <View style={styles.wrap}>
        <View style={styles.subHeader}>
          <Pressable onPress={() => setView('books')} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primary} />
            <Text style={styles.backLabel}>Books</Text>
          </Pressable>
          <Text style={typography.heading}>{book.name}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollPad}>
          <View style={styles.chapterGrid}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
              <Pressable key={n} onPress={() => openChapter(n)} style={styles.chapterCell}>
                <Text style={styles.chapterCellLabel}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // reader
  return (
    <View style={styles.wrap}>
      <View style={styles.subHeader}>
        <Pressable onPress={() => setView('chapters')} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primary} />
          <Text style={styles.backLabel}>{book?.name}</Text>
        </Pressable>
        <Text style={typography.heading}>
          {book?.name} {chapter}
        </Text>
      </View>
      {versionRow}

      <ScrollView contentContainerStyle={[styles.scrollPad, { gap: spacing.sm }]}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
        {!loading && failed && (
          <View style={styles.errorBox}>
            <Text style={typography.body}>Couldn't load this chapter — check your connection.</Text>
            <PrimaryButton
              label="Try again"
              variant="secondary"
              onPress={() => {
                if (book && chapter) {
                  setFailed(false);
                  setLoading(true);
                  fetchPassage(`${book.name} ${chapter}`, version).then((v) => {
                    setLoading(false);
                    if (v.length === 0) setFailed(true);
                    else setVerses(v);
                  });
                }
              }}
            />
          </View>
        )}
        {!loading &&
          !failed &&
          verses.map((v) => {
            const key = `${v.reference}|${v.version}`;
            const highlighted = highlightedVerses.includes(key);
            return (
              <Pressable key={v.reference} onPress={() => toggleHighlight(key)}>
                <Text style={[styles.verseLine, highlighted && styles.verseLineHighlighted]}>
                  <Text style={styles.verseNum}>{v.reference.split(':').pop()} </Text>
                  {v.text}
                </Text>
              </Pressable>
            );
          })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navRow}>
          <Pressable
            onPress={() => changeChapter(-1)}
            disabled={isFirstChapterOfBible}
            style={[styles.navBtn, isFirstChapterOfBible && styles.navBtnDisabled]}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
            <Text style={typography.body}>Prev</Text>
          </Pressable>
          <Pressable
            onPress={() => changeChapter(1)}
            disabled={isLastChapterOfBible}
            style={[styles.navBtn, isLastChapterOfBible && styles.navBtnDisabled]}
          >
            <Text style={typography.body}>Next</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text} />
          </Pressable>
        </View>
        <PrimaryButton
          label={readToday ? "Today's reading logged ✓" : "Mark today's reading complete"}
          onPress={recordBibleReadToday}
          disabled={readToday}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object, scheme: 'light' | 'dark') {
  return StyleSheet.create({
    wrap: { flex: 1 },
    scrollPad: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
    versionRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
    versionChip: {
      height: 34,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    versionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    versionChipLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.text },
    versionChipLabelActive: { color: colors.primaryText },
    search: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: 15,
      color: colors.text,
    },
    sectionTitle: { marginTop: spacing.md, marginBottom: spacing.xs },
    bookGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    bookChip: {
      minHeight: 40,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...cardShadow,
    },
    bookChipLabel: { fontSize: 14, lineHeight: 18, color: colors.text },
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center' },
    backLabel: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chapterCell: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow,
    },
    chapterCellLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    verseLine: { fontSize: 16, lineHeight: 26, color: colors.text },
    verseLineHighlighted: {
      backgroundColor: colors.accent,
      color: scheme === 'dark' ? '#2A2100' : '#3A2E00',
    },
    verseNum: { fontWeight: '700', color: colors.primary },
    errorBox: { gap: spacing.md, alignItems: 'flex-start', marginTop: spacing.lg },
    footer: { padding: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    navRow: { flexDirection: 'row', justifyContent: 'space-between' },
    navBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    navBtnDisabled: { opacity: 0.3 },
  });
}
