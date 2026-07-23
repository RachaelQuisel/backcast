import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/user-store';
import { EXERCISES, backcast, targetAtAge } from '@/constants/exercises';
import { EXERCISE_IMAGES } from '@/constants/exercise-images';

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    age,
    targetAge,
    activityLevel,
    selectedGoals,
    logs,
    customTargets,
    setCustomTarget,
    setActivityLevel,
  } = useUserStore();
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activityPickerOpen, setActivityPickerOpen] = useState(false);

  if (!age) return null;

  const activeExercises = EXERCISES.filter((e) => selectedGoals.includes(e.id));

  // Get the most recent log for each exercise
  const latestLogs = new Map<string, number>();
  for (const log of logs) {
    const existing = latestLogs.get(log.exerciseId);
    if (!existing) {
      latestLogs.set(log.exerciseId, log.value);
    }
  }
  // Re-iterate to get the truly latest by date
  for (const exerciseId of selectedGoals) {
    const exerciseLogs = logs
      .filter((l) => l.exerciseId === exerciseId)
      .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
    if (exerciseLogs.length > 0) {
      latestLogs.set(exerciseId, exerciseLogs[0].value);
    }
  }

  const decadesLeftNum = Math.max(0, (targetAge - age) / 10);
  const decadesLeft = decadesLeftNum.toFixed(1);
  const pastHorizon = decadesLeftNum === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Backcast</Text>
            <Text style={styles.headerSub}>
              {pastHorizon
                ? "You're past your target age — update it in settings"
                : `${decadesLeft} decades to build your future self`}
            </Text>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.settingsIcon}>i</Text>
          </Pressable>
        </View>

        {/* Age summary */}
        <View style={styles.ageBanner}>
          <View style={styles.ageBlock}>
            <Text style={styles.ageNumber}>{age}</Text>
            <Text style={styles.ageLabel}>You now</Text>
          </View>
          <View style={styles.ageArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.ageBlock}>
            <Text style={styles.ageNumber}>{targetAge}</Text>
            <Text style={styles.ageLabel}>Your goal</Text>
          </View>
        </View>

        {/* Activity level pill */}
        <Pressable
          style={styles.activityPill}
          onPress={() => setActivityPickerOpen((v) => !v)}
        >
          <View style={styles.activityPillRow}>
            <Text style={styles.activityPillLabel}>Activity level</Text>
            <Text style={styles.activityPillValue}>
              {activityLevel === 'active' ? 'Active · 8%/decade' : 'Sedentary · 13%/decade'}
            </Text>
            <Text style={styles.activityPillChevron}>{activityPickerOpen ? '▲' : '▼'}</Text>
          </View>
          {activityPickerOpen && (
            <View style={styles.activityPickerRow}>
              {(['active', 'sedentary'] as const).map((level) => {
                const isSelected = activityLevel === level;
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.activityPickerOption,
                      isSelected && styles.activityPickerOptionSelected,
                    ]}
                    onPress={() => {
                      if (!isSelected) setActivityLevel(level);
                      setActivityPickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.activityPickerOptionTitle,
                        isSelected && styles.activityPickerOptionTitleSelected,
                      ]}
                    >
                      {level === 'active' ? 'Active' : 'Sedentary'}
                    </Text>
                    <Text style={styles.activityPickerOptionSub}>
                      {level === 'active' ? '8% decline / decade' : '13% decline / decade'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>

        {/* Exercise cards */}
        <Text style={styles.sectionTitle}>Your targets right now</Text>
        {activeExercises.map((exercise) => {
          const custom = customTargets[exercise.id];
          // The stored commitment (or the default shaped the same way) drives
          // required-now. If custom's stamp has drifted from the profile, the
          // card warns loudly instead of silently re-anchoring.
          const target = custom ?? {
            value: exercise.baseValueAt100,
            targetAge,
            activityLevel,
          };
          const isStale =
            custom !== undefined &&
            (custom.targetAge !== targetAge || custom.activityLevel !== activityLevel);
          const currentTarget = backcast(target.value, age, target.targetAge, target.activityLevel);
          const latestLog = latestLogs.get(exercise.id);
          const progress = latestLog ? (latestLog / currentTarget) * 100 : null;
          const isEditing = editingExercise === exercise.id;

          return (
            <Pressable
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => {
                if (!isEditing) {
                  router.push({
                    pathname: '/log',
                    params: { exerciseId: exercise.id },
                  });
                }
              }}
            >
              <View style={styles.exerciseHeader}>
                {EXERCISE_IMAGES[exercise.id] && (
                  <Image
                    source={EXERCISE_IMAGES[exercise.id]}
                    style={styles.exerciseThumb}
                    resizeMode="cover"
                    accessibilityLabel={exercise.name}
                  />
                )}
                <View style={styles.exerciseHeaderText}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseActivity}>{exercise.description}</Text>
                </View>
              </View>

              <View style={styles.targetRow}>
                <View style={styles.targetBlock}>
                  <Text style={styles.targetValue}>
                    {currentTarget.toFixed(1)}
                  </Text>
                  <Text style={styles.targetLabel}>
                    Your target now ({exercise.unit})
                  </Text>
                </View>
                <View style={styles.goalBlock}>
                  <Text style={styles.goalValue}>
                    {target.value.toFixed(1)}
                  </Text>
                  <View style={styles.goalLabelRow}>
                    <Text style={styles.targetLabel}>
                      At {target.targetAge}
                    </Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        if (isEditing) {
                          setEditingExercise(null);
                        } else {
                          setEditingExercise(exercise.id);
                          setEditValue(target.value.toFixed(0));
                        }
                      }}
                      hitSlop={8}
                    >
                      <Text style={styles.editButton}>{isEditing ? 'cancel' : 'adjust'}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {isEditing && (
                <View style={styles.editContainer}>
                  <Text style={styles.editLabel}>
                    Your goal at {targetAge} ({exercise.unit.split(' ')[0]})
                  </Text>
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType="decimal-pad"
                      autoFocus
                    />
                    <Pressable
                      style={styles.editSave}
                      onPress={(e) => {
                        e.stopPropagation();
                        const num = Number(editValue);
                        if (num > 0) {
                          // Stamp targetAge AND activityLevel so a later
                          // change to either won't silently re-anchor.
                          setCustomTarget(exercise.id, num, targetAge, activityLevel);
                        }
                        setEditingExercise(null);
                      }}
                    >
                      <Text style={styles.editSaveText}>Save</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.editHint}>
                    Default: {exercise.baseValueAt100.toFixed(0)} ·
                    Min: {exercise.minTargetAt100.toFixed(0)}
                  </Text>
                </View>
              )}

              {isStale && custom && !isEditing && (
                <Text style={styles.staleWarning}>
                  Set for age {custom.targetAge}
                  {custom.activityLevel !== activityLevel ? ` (${custom.activityLevel})` : ''}
                  {' · '}your current is age {targetAge}
                  {custom.activityLevel !== activityLevel ? ` (${activityLevel})` : ''}
                  . Tap adjust to update.
                </Text>
              )}

              {!isEditing && progress !== null && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor:
                            progress >= 100
                              ? '#34D399'
                              : progress >= 70
                              ? '#FBBF24'
                              : '#888',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {latestLog?.toFixed(1)} logged · {progress.toFixed(0)}%
                  </Text>
                </View>
              )}

              {!isEditing && progress === null && (
                <Text style={styles.logPrompt}>Tap to log your current level</Text>
              )}
            </Pressable>
          );
        })}

        {/* Decade breakdown */}
        <Text style={styles.sectionTitle}>Your decade roadmap</Text>
        <View style={styles.decadeTable}>
          <View style={styles.decadeHeaderRow}>
            <Text style={[styles.decadeCell, styles.decadeHeaderText, { flex: 2 }]}>
              Exercise
            </Text>
            {generateDecadeAges(age, targetAge).map((a) => (
              <Text key={a} style={[styles.decadeCell, styles.decadeHeaderText]}>
                {a}
              </Text>
            ))}
          </View>
          {activeExercises.map((exercise) => {
            const target = customTargets[exercise.id] ?? {
              value: exercise.baseValueAt100,
              targetAge,
              activityLevel,
            };
            return (
              <View key={exercise.id} style={styles.decadeRow}>
                <Text
                  style={[styles.decadeCell, styles.decadeName, { flex: 2 }]}
                  numberOfLines={1}
                >
                  {exercise.name}
                </Text>
                {generateDecadeAges(age, targetAge).map((a) => (
                  <Text key={a} style={[styles.decadeCell, styles.decadeValue]}>
                    {targetAtAge(target.value, a, target.targetAge, target.activityLevel).toFixed(0)}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={styles.navButton} onPress={() => router.push('/goals')}>
          <Text style={styles.navText}>Goals</Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => {}}
        >
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => router.push('/about')}>
          <Text style={styles.navText}>About</Text>
        </Pressable>
      </View>
    </View>
  );
}

function generateDecadeAges(currentAge: number, targetAge: number): number[] {
  if (targetAge <= currentAge) return [targetAge];
  const ages: number[] = [];
  // Round current age up to nearest 10
  const startDecade = Math.ceil(currentAge / 10) * 10;
  for (let a = startDecade; a <= targetAge; a += 10) {
    ages.push(a);
  }
  // Always include target age if not already there
  if (!ages.includes(targetAge)) {
    ages.push(targetAge);
  }
  return ages;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: '#888',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  ageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151520',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    gap: 24,
  },
  ageBlock: {
    alignItems: 'center',
  },
  ageNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ageLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  ageArrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 24,
    color: '#444',
  },
  activityPill: {
    backgroundColor: '#151520',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  activityPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityPillLabel: {
    fontSize: 13,
    color: '#666',
  },
  activityPillValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activityPillChevron: {
    fontSize: 10,
    color: '#666',
  },
  activityPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  activityPickerOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2A2A3A',
    backgroundColor: '#1A1A2A',
  },
  activityPickerOptionSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#1A2A3F',
  },
  activityPickerOptionTitle: {
    fontSize: 15,
    color: '#CCC',
    fontWeight: '700',
    marginBottom: 4,
  },
  activityPickerOptionTitleSelected: {
    color: '#4A9EFF',
  },
  activityPickerOptionSub: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: '#151520',
    borderRadius: 16,
    marginBottom: 12,
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  exerciseHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  exerciseThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#0A0A0F',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exerciseActivity: {
    fontSize: 13,
    color: '#666',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 20,
  },
  targetBlock: {
    flex: 1,
  },
  goalBlock: {
    alignItems: 'flex-end',
  },
  goalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    fontSize: 12,
    color: '#4A9EFF',
    fontWeight: '600',
  },
  editContainer: {
    marginTop: 16,
    backgroundColor: '#1A1A2A',
    borderRadius: 10,
    padding: 16,
  },
  editLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#4A9EFF',
    paddingBottom: 4,
  },
  editSave: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editHint: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
  },
  targetValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A9EFF',
  },
  goalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#444',
  },
  targetLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2A2A3A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  logPrompt: {
    fontSize: 13,
    color: '#4A9EFF',
    marginTop: 12,
  },
  staleWarning: {
    fontSize: 12,
    color: '#FBBF24',
    marginTop: 12,
    lineHeight: 18,
  },
  decadeTable: {
    backgroundColor: '#151520',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  decadeHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
    paddingBottom: 10,
    marginBottom: 8,
  },
  decadeRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  decadeCell: {
    flex: 1,
    textAlign: 'center',
  },
  decadeHeaderText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  decadeName: {
    fontSize: 13,
    color: '#AAA',
    textAlign: 'left',
  },
  decadeValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#1A1A2A',
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {},
  navText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#4A9EFF',
  },
});
