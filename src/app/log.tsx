import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/user-store';
import { EXERCISES, backcast } from '@/constants/exercises';
import { EXERCISE_IMAGES } from '@/constants/exercise-images';

export default function Log() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { age, targetAge, activityLevel, addLog, logs, customTargets } = useUserStore();
  const [value, setValue] = useState('');

  const exercise = EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise || !age) return null;

  const target = customTargets[exercise.id] ?? {
    value: exercise.baseValueAt100,
    targetAge,
    activityLevel,
  };
  const currentTarget = backcast(target.value, age, target.targetAge, target.activityLevel);

  // Previous logs for this exercise
  const previousLogs = logs
    .filter((l) => l.exerciseId === exerciseId)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
    .slice(0, 5);

  const handleSave = () => {
    const numValue = Number(value);
    if (numValue <= 0) return;

    addLog({
      exerciseId: exercise.id,
      value: numValue,
      loggedAt: new Date().toISOString(),
    });

    router.back();
  };

  const numValue = Number(value);
  const progress = numValue > 0 ? (numValue / currentTarget) * 100 : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.main}>
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
              <Text style={styles.activityDesc}>{exercise.description}</Text>
            </View>
          </View>

          <View style={styles.targetInfo}>
            <Text style={styles.targetLabel}>Your target right now</Text>
            <Text style={styles.targetValue}>
              {currentTarget.toFixed(1)}{' '}
              <Text style={styles.targetUnit}>{exercise.unit}</Text>
            </Text>
          </View>

          <Text style={styles.inputLabel}>What can you do today?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#333"
              autoFocus
            />
            <Text style={styles.unitText}>{exercise.unit.split(' ')[0]}</Text>
          </View>

          {numValue > 0 && (
            <View style={styles.feedbackContainer}>
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
              <Text style={styles.feedbackText}>
                {progress >= 100
                  ? 'You\'re ahead of your target — building a strong buffer!'
                  : progress >= 70
                  ? 'Solid progress — you\'re in the zone.'
                  : 'Room to grow — every session counts.'}
              </Text>
            </View>
          )}

          {previousLogs.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Recent entries</Text>
              {previousLogs.map((log) => (
                <View key={log.id} style={styles.historyRow}>
                  <Text style={styles.historyDate}>
                    {new Date(log.loggedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyValue}>
                    {log.value} {exercise.unit.split(' ')[0]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={[styles.saveButton, numValue <= 0 && styles.saveDisabled]}
          onPress={handleSave}
          disabled={numValue <= 0}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4A9EFF',
  },
  main: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  exerciseHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  exerciseThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#151520',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 15,
    color: '#666',
  },
  targetInfo: {
    backgroundColor: '#151520',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  targetLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A9EFF',
  },
  targetUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  inputLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  input: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 8,
    minWidth: 120,
  },
  unitText: {
    fontSize: 20,
    color: '#666',
  },
  feedbackContainer: {
    marginTop: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A3A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  historySection: {
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveDisabled: {
    backgroundColor: '#333',
  },
  saveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
