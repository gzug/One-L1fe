import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IdeasNotesCard } from '../components/IdeasNotesCard';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const EXPERIMENTS_KEY = '@one_l1fe_experiments_v1';

type ExperimentCategory = 'Nutrition' | 'Recovery' | 'Activity' | 'Sleep' | 'Custom';
const CATEGORIES: ExperimentCategory[] = ['Nutrition', 'Recovery', 'Activity', 'Sleep', 'Custom'];

type Experiment = {
  id: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  hypothesis: string;
  startDate: string;
  endDate: string;
  createdAt: number;
};

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToIso(from: string, days: number): string {
  const base = from.match(/^\d{4}-\d{2}-\d{2}$/) ? from : isoToday();
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getStatus(exp: Experiment): 'planned' | 'active' | 'completed' {
  const now = Date.now();
  const start = new Date(exp.startDate).getTime();
  const end = new Date(exp.endDate).getTime();
  if (!isNaN(end) && now > end + 86400000) return 'completed';
  if (!isNaN(start) && !isNaN(end) && now >= start && now <= end + 86400000) return 'active';
  return 'planned';
}

async function loadExperiments(): Promise<Experiment[]> {
  try {
    const raw = await AsyncStorage.getItem(EXPERIMENTS_KEY);
    return raw ? (JSON.parse(raw) as Experiment[]) : [];
  } catch { return []; }
}

async function persistExperiments(items: Experiment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(items));
  } catch { /* noop */ }
}

const NEXT_INTEGRATIONS: { label: string; desc: string }[] = [
  { label: 'Nutrition', desc: 'Dietary intake and macro tracking' },
  { label: 'Mental Health', desc: 'Mood, stress, and cognitive signals' },
  { label: 'DNA Insights', desc: 'Genetic predispositions and traits' },
  { label: 'Stool Analysis', desc: 'Gut microbiome and digestive health' },
  { label: 'Urine Analysis', desc: 'Metabolic and kidney health markers' },
];

export function InsightsScreen() {
  const { colors } = useTheme();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    loadExperiments().then(setExperiments);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    persistExperiments(experiments);
  }, [experiments]);

  const handleAdd = useCallback((exp: Omit<Experiment, 'id' | 'createdAt'>) => {
    setExperiments((prev) => [
      { ...exp, id: Date.now().toString(), createdAt: Date.now() },
      ...prev,
    ]);
    setFormOpen(false);
  }, []);

  function handleDelete(id: string) {
    setExperiments((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.container}>
          <View style={[styles.hero, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.heroEyebrow, { color: colors.brandGreen }]}>Insights & Experiments</Text>
            <Text style={[styles.heroTitle, { color: colors.text, fontFamily: 'BrandDisplay' }]}>Your health lab</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
              Plan and track self-experiments. Log a change, set a timeframe, then watch how it moves your metrics.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Experiments</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSubtle }]}>
                  Track a routine change and observe the impact.
                </Text>
              </View>
              <Pressable
                onPress={() => setFormOpen(true)}
                style={({ pressed }) => [
                  styles.newBtn,
                  { backgroundColor: colors.brandGreenSoft, borderColor: colors.accentBorder },
                  pressed && { opacity: 0.72 },
                ]}
                accessibilityLabel="Plan a new experiment"
              >
                <Text style={[styles.newBtnText, { color: colors.brandGreenDark }]}>+ New</Text>
              </Pressable>
            </View>

            {experiments.length === 0 ? (
              <Pressable
                onPress={() => setFormOpen(true)}
                style={({ pressed }) => [
                  styles.emptyCard,
                  { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                  pressed && { opacity: 0.76 },
                ]}
                accessibilityLabel="Plan your first experiment"
              >
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Plan your first experiment</Text>
                <Text style={[styles.emptyExample, { color: colors.textMuted }]}>
                  e.g. "30 days meat-free — does it improve my Recovery score?"
                </Text>
                <Text style={[styles.emptyLink, { color: colors.brandGreen }]}>+ Plan an experiment →</Text>
              </Pressable>
            ) : (
              experiments.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  onDelete={handleDelete}
                  colors={colors}
                />
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes & Ideas</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSubtle }]}>
                  Quick observations, questions, hypotheses.
                </Text>
              </View>
            </View>
            <IdeasNotesCard />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>Next integrations</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.disabled }]}>
                  Premium data sources in development
                </Text>
              </View>
            </View>
            {NEXT_INTEGRATIONS.map((item) => (
              <View
                key={item.label}
                style={[styles.nextRow, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nextLabel, { color: colors.textSubtle }]}>{item.label}</Text>
                  <Text style={[styles.nextDesc, { color: colors.disabled }]}>{item.desc}</Text>
                </View>
                <View style={[styles.comingSoonPill, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
                  <Text style={[styles.comingSoonText, { color: colors.disabled }]}>Coming soon</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ExperimentFormModal
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleAdd}
        colors={colors}
      />
    </>
  );
}

function ExperimentCard({
  experiment,
  onDelete,
  colors,
}: {
  experiment: Experiment;
  onDelete: (id: string) => void;
  colors: ThemeColors;
}) {
  const status = getStatus(experiment);
  const statusColor =
    status === 'active' ? colors.brandGreen :
    status === 'completed' ? colors.textMuted :
    colors.textSubtle;
  const statusBg =
    status === 'active' ? colors.brandGreenSoft :
    status === 'completed' ? colors.surfaceSoft :
    colors.surface;

  return (
    <View style={[styles.expCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <View style={styles.expCardTop}>
        <View style={[styles.categoryChip, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Text style={[styles.categoryText, { color: colors.brandGreenDark }]}>{experiment.category}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusBg, borderColor: `${statusColor}55` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
        <Pressable
          onPress={() => onDelete(experiment.id)}
          hitSlop={12}
          style={styles.expDeleteBtn}
          accessibilityLabel="Delete experiment"
        >
          <Text style={[styles.expDeleteText, { color: colors.textSubtle }]}>×</Text>
        </Pressable>
      </View>

      <Text style={[styles.expTitle, { color: colors.text }]}>{experiment.title}</Text>

      {experiment.description ? (
        <Text style={[styles.expDesc, { color: colors.textMuted }]} numberOfLines={2}>
          {experiment.description}
        </Text>
      ) : null}

      {experiment.hypothesis ? (
        <View style={[styles.hypothesisBox, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.hypothesisLabel, { color: colors.textSubtle }]}>Hypothesis</Text>
          <Text style={[styles.hypothesisText, { color: colors.textMuted }]} numberOfLines={3}>
            {experiment.hypothesis}
          </Text>
        </View>
      ) : null}

      {(experiment.startDate || experiment.endDate) ? (
        <Text style={[styles.expDates, { color: colors.textSubtle }]}>
          {experiment.startDate || '?'} → {experiment.endDate || '?'}
        </Text>
      ) : null}
    </View>
  );
}

function ExperimentFormModal({
  visible,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (exp: Omit<Experiment, 'id' | 'createdAt'>) => void;
  colors: ThemeColors;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExperimentCategory>('Custom');
  const [hypothesis, setHypothesis] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function reset() {
    setTitle(''); setDescription(''); setCategory('Custom');
    setHypothesis(''); setStartDate(''); setEndDate('');
  }

  function handleClose() {
    reset();
    Keyboard.dismiss();
    onClose();
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      hypothesis: hypothesis.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
    });
    reset();
    Keyboard.dismiss();
  }

  const canSave = title.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={formStyles.backdrop}>
          <TouchableWithoutFeedback onPress={() => { /* absorb */ }}>
            <ScrollView
              style={[formStyles.sheet, { backgroundColor: colors.surfaceElevated }]}
              contentContainerStyle={formStyles.sheetContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[formStyles.handle, { backgroundColor: colors.borderSubtle }]} />

              <View style={formStyles.sheetHeader}>
                <Text style={[formStyles.sheetTitle, { color: colors.text }]}>Plan an experiment</Text>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    formStyles.cancelBtn,
                    { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                    pressed && { opacity: 0.72 },
                  ]}
                >
                  <Text style={[formStyles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
                </Pressable>
              </View>

              <FormField label="Title *" colors={colors}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. 30 days meat-free"
                  placeholderTextColor={colors.textSubtle}
                  style={[formStyles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}
                  returnKeyType="next"
                  autoFocus
                />
              </FormField>

              <FormField label="Category" colors={colors}>
                <View style={formStyles.chips}>
                  {CATEGORIES.map((cat) => {
                    const active = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={({ pressed }) => [
                          formStyles.chip,
                          active
                            ? { backgroundColor: colors.brandGreenSoft, borderColor: colors.accentBorder }
                            : { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                          pressed && { opacity: 0.72 },
                        ]}
                      >
                        <Text style={[formStyles.chipText, { color: active ? colors.brandGreenDark : colors.textSubtle }]}>
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FormField>

              <FormField label="Description" colors={colors}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What are you changing and why?"
                  placeholderTextColor={colors.textSubtle}
                  style={[formStyles.input, formStyles.inputMulti, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}
                  multiline
                  textAlignVertical="top"
                />
              </FormField>

              <View style={formStyles.fieldRow}>
                <View style={{ flex: 1 }}>
                  <FormField label="Start date" colors={colors}>
                    <TextInput
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSubtle}
                      style={[formStyles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}
                    />
                    <View style={formStyles.quickRow}>
                      <Pressable
                        onPress={() => setStartDate(isoToday())}
                        style={[formStyles.quickBtn, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
                      >
                        <Text style={[formStyles.quickText, { color: colors.textSubtle }]}>Today</Text>
                      </Pressable>
                    </View>
                  </FormField>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="End date" colors={colors}>
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSubtle}
                      style={[formStyles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}
                    />
                    <View style={formStyles.quickRow}>
                      {([30, 90] as const).map((d) => (
                        <Pressable
                          key={d}
                          onPress={() => setEndDate(addDaysToIso(startDate, d))}
                          style={[formStyles.quickBtn, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
                        >
                          <Text style={[formStyles.quickText, { color: colors.textSubtle }]}>+{d}d</Text>
                        </Pressable>
                      ))}
                    </View>
                  </FormField>
                </View>
              </View>

              <FormField
                label="Hypothesis"
                hint="What do you expect to observe in your metrics?"
                colors={colors}
              >
                <TextInput
                  value={hypothesis}
                  onChangeText={setHypothesis}
                  placeholder="I expect my Recovery score to improve because..."
                  placeholderTextColor={colors.textSubtle}
                  style={[formStyles.input, formStyles.inputMulti, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}
                  multiline
                  textAlignVertical="top"
                />
              </FormField>

              <View style={[formStyles.metricsHint, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}>
                <Text style={[formStyles.metricsHintText, { color: colors.textSubtle }]}>
                  After saving, compare your experiment timeframe with your Trends data to observe metric changes.
                </Text>
              </View>

              <Pressable
                onPress={handleSave}
                disabled={!canSave}
                style={({ pressed }) => [
                  formStyles.saveBtn,
                  { backgroundColor: canSave ? colors.brandGreen : colors.disabled },
                  pressed && canSave && { opacity: 0.8 },
                ]}
                accessibilityLabel="Save experiment"
              >
                <Text style={formStyles.saveBtnText}>Save experiment</Text>
              </Pressable>
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function FormField({
  label,
  hint,
  colors,
  children,
}: {
  label: string;
  hint?: string;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={formStyles.field}>
      <Text style={[formStyles.fieldLabel, { color: colors.textSubtle }]}>{label}</Text>
      {hint ? <Text style={[formStyles.fieldHint, { color: colors.disabled }]}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: 108,
  },
  container: {
    width: '100%',
    maxWidth: layout.maxWidth,
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.xl,
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroEyebrow: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '600',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  newBtn: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtnText: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyExample: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyLink: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  expCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#0B1C12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  expCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: typography.micro,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: typography.micro,
    fontWeight: '700',
  },
  expDeleteBtn: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expDeleteText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  expTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  expDesc: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '600',
  },
  hypothesisBox: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    gap: 3,
  },
  hypothesisLabel: {
    fontSize: typography.micro,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  hypothesisText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
  },
  expDates: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  nextRow: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    opacity: 0.72,
  },
  nextLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
  },
  nextDesc: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '500',
    marginTop: 1,
  },
  comingSoonPill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  comingSoonText: {
    fontSize: typography.micro,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.7,
  },
});

const formStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  cancelBtn: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  fieldHint: {
    fontSize: typography.micro,
    lineHeight: lineHeights.caption,
    fontWeight: '500',
    marginTop: -2,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  input: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  inputMulti: {
    minHeight: 80,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quickBtn: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  quickText: {
    fontSize: typography.micro,
    fontWeight: '700',
  },
  metricsHint: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  metricsHintText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
  },
  saveBtn: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
