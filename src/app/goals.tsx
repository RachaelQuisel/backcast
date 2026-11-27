import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/user-store';
import { EXERCISES, backcast, type Exercise } from '@/constants/exercises';
import { MinTouch, Radius, Spacing, Type, type PaletteColors } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { useCountUp } from '@/hooks/use-count-up';

/** Same goal ages onboarding offers, so both screens agree. */
const AGE_CHOICES = [75, 80, 85, 90, 100] as const;

/**
 * Goals: pick the everyday activities you want to keep at your goal age.
 *
 * Design pilot for docs/design-plan.md. The goal-age numeral is the one bold
 * element; tapping it opens the age choices, and each row's target recounts.
 */
export default function Goals() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, scheme } = usePalette();
  const styles = makeStyles(colors);

  const {
    age,
    sex,
    weight,
    targetAge,
    activityLevel,
    customTargets,
    selectedGoals,
    toggleGoal,
    setSelectedGoals,
    setProfile,
  } = useUserStore();
  const [agePickerOpen, setAgePickerOpen] = useState(false);

  const count = selectedGoals.length;

  const chooseTargetAge = (next: number) => {
    // setProfile is the store's only way to change targetAge; it keeps the
    // rest of the profile as is. Stale custom targets are flagged on the
    // dashboard, same as a change made during onboarding.
    if (age && sex && weight && next !== targetAge) {
      setProfile({ age, sex, weight, targetAge: next, activityLevel });
    }
    setAgePickerOpen(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
      >
        <Text style={styles.title} accessibilityRole="header">
          What do you want to do at
        </Text>

        <Pressable
          style={styles.ageButton}
          onPress={() => setAgePickerOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={`Goal age ${targetAge}. Change goal age`}
          accessibilityState={{ expanded: agePickerOpen }}
        >
          <Text style={styles.ageNumeral}>{targetAge}</Text>
          <Text style={styles.ageCaret}>{agePickerOpen ? '▴' : '▾'}</Text>
        </Pressable>

        {agePickerOpen && (
          <View style={styles.ageChoices}>
            {AGE_CHOICES.map((choice) => {
              const isCurrent = choice === targetAge;
              return (
                <Pressable
                  key={choice}
                  style={[styles.ageChoice, isCurrent && styles.ageChoiceCurrent]}
                  onPress={() => chooseTargetAge(choice)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCurrent }}
                >
                  <Text style={[styles.ageChoiceText, isCurrent && styles.ageChoiceTextCurrent]}>
                    {choice}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.intro}>
          Pick what matters to you. Each one maps to an exercise with a target to train for.
        </Text>

        <View style={styles.list}>
          {EXERCISES.map((exercise) => {
            const custom = customTargets[exercise.id];
            // Mirrors the dashboard: the stored commitment, else the default.
            const target = custom ?? { value: exercise.baseValueAt100, targetAge, activityLevel };
            const today =
              age !== null
                ? backcast(target.value, age, target.targetAge, target.activityLevel)
                : null;
            return (
              <GoalRow
                key={exercise.id}
                exercise={exercise}
                today={today}
                selected={selectedGoals.includes(exercise.id)}
                onToggle={() => toggleGoal(exercise.id)}
                styles={styles}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Pressable
          style={styles.selectAll}
          onPress={() => setSelectedGoals(EXERCISES.map((e) => e.id))}
          accessibilityRole="button"
        >
          <Text style={styles.selectAllText}>Select all</Text>
        </Pressable>
        <View style={styles.continueWrap}>
          <Pressable
            style={[styles.continueButton, count === 0 && styles.continueDisabled]}
            disabled={count === 0}
            onPress={() => router.replace('/dashboard')}
            accessibilityRole="button"
            accessibilityState={{ disabled: count === 0 }}
          >
            <Text style={styles.continueText}>
              {count === 0
                ? 'Continue'
                : `Continue with ${count} ${count === 1 ? 'goal' : 'goals'}`}
            </Text>
          </Pressable>
          {count === 0 && <Text style={styles.hint}>Pick at least one goal</Text>}
        </View>
      </View>
    </View>
  );
}

/** One goal: the real-life activity, its exercise, and today's target. */
function GoalRow({
  exercise,
  today,
  selected,
  onToggle,
  styles,
}: {
  exercise: Exercise;
  today: number | null;
  selected: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const shown = useCountUp(today ?? 0);
  return (
    <Pressable
      style={styles.row}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.activity}>{exercise.description}</Text>
        <Text style={styles.mapping}>
          {today === null
            ? `${exercise.name}. Your target appears after you add your age.`
            : `${exercise.name}: ${shown.toFixed(1)} ${exercise.unit} today`}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: PaletteColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.paper,
    },
    content: {
      paddingHorizontal: Spacing.four,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
    title: {
      ...Type.title,
      color: c.ink,
    },
    ageButton: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      alignSelf: 'flex-start',
      gap: Spacing.two,
      minHeight: MinTouch,
      marginTop: Spacing.two,
    },
    ageNumeral: {
      ...Type.numeral,
      color: c.future,
    },
    ageCaret: {
      ...Type.heading,
      color: c.future,
      paddingBottom: Spacing.two,
    },
    ageChoices: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
      marginTop: Spacing.three,
    },
    ageChoice: {
      minWidth: 56,
      minHeight: MinTouch,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.round,
      borderWidth: 1,
      borderColor: c.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ageChoiceCurrent: {
      backgroundColor: c.futureFill,
      borderColor: c.futureFill,
    },
    ageChoiceText: {
      ...Type.body,
      fontFamily: Type.cardTitle.fontFamily,
      color: c.ink,
    },
    ageChoiceTextCurrent: {
      color: c.onFuture,
    },
    intro: {
      ...Type.body,
      color: c.muted,
      marginTop: Spacing.four,
      marginBottom: Spacing.four,
    },
    list: {
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.three,
      paddingVertical: Spacing.three + Spacing.one,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    check: {
      width: 28,
      height: 28,
      marginTop: 1,
      borderRadius: Radius.round,
      borderWidth: 2,
      borderColor: c.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: {
      backgroundColor: c.today,
      borderColor: c.today,
    },
    checkMark: {
      ...Type.small,
      fontFamily: Type.title.fontFamily,
      color: c.onToday,
    },
    rowText: {
      flex: 1,
    },
    activity: {
      ...Type.cardTitle,
      color: c.ink,
    },
    mapping: {
      ...Type.small,
      color: c.muted,
      marginTop: Spacing.one,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      backgroundColor: c.paper,
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    selectAll: {
      minHeight: 52,
      justifyContent: 'center',
      paddingHorizontal: Spacing.one,
    },
    selectAllText: {
      ...Type.body,
      fontFamily: Type.cardTitle.fontFamily,
      color: c.today,
    },
    continueWrap: {
      flex: 1,
    },
    continueButton: {
      minHeight: 52,
      borderRadius: Radius.row,
      backgroundColor: c.today,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.three,
    },
    continueDisabled: {
      opacity: 0.45,
    },
    continueText: {
      ...Type.body,
      fontFamily: Type.title.fontFamily,
      color: c.onToday,
    },
    hint: {
      ...Type.small,
      color: c.muted,
      marginTop: Spacing.two,
      textAlign: 'center',
    },
  });
