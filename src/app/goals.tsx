import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/user-store';
import { EXERCISES } from '@/constants/exercises';

export default function Goals() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const selectedGoals = useUserStore((s) => s.selectedGoals);
  const toggleGoal = useUserStore((s) => s.toggleGoal);
  const setSelectedGoals = useUserStore((s) => s.setSelectedGoals);

  const handleSelectAll = () => {
    setSelectedGoals(EXERCISES.map((e) => e.id));
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      handleSelectAll();
    }
    router.replace('/dashboard');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.title}>What do you want to{'\n'}do at 80?</Text>
        <Text style={styles.subtitle}>
          Pick the activities that matter to you. Each one maps to a specific exercise with a
          target you can train toward.
        </Text>

        {EXERCISES.map((exercise) => {
          const isSelected = selectedGoals.includes(exercise.id);
          return (
            <Pressable
              key={exercise.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleGoal(exercise.id)}
            >
              <View style={styles.cardContent}>
                <Text style={[styles.activityName, isSelected && styles.textSelected]}>
                  {exercise.description}
                </Text>
                <Text style={styles.exerciseMapping}>
                  {exercise.name} · {exercise.unit}
                </Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.selectAllButton} onPress={handleSelectAll}>
          <Text style={styles.selectAllText}>Select all</Text>
        </Pressable>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>
            {selectedGoals.length === 0
              ? 'Select all & continue'
              : `See my targets (${selectedGoals.length})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
    marginBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151520',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#1A2030',
  },
  cardContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#CCC',
    marginBottom: 4,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  exerciseMapping: {
    fontSize: 13,
    color: '#666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#4A9EFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#1A1A2A',
    flexDirection: 'row',
    gap: 12,
  },
  selectAllButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectAllText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#4A9EFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
