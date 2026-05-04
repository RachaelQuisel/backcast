import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/user-store';
import { ActivityLevel } from '@/constants/exercises';

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setProfile = useUserStore((s) => s.setProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [targetAge, setTargetAge] = useState('80');

  const canProceed = () => {
    if (step === 0) return true; // welcome screen
    if (step === 1) return age !== '' && Number(age) > 0 && Number(age) < 100;
    if (step === 2) return sex !== null;
    if (step === 3) return weight !== '' && Number(weight) > 0;
    if (step === 4) return activityLevel !== null;
    if (step === 5) return Number(targetAge) >= 70 && Number(targetAge) <= 100;
    return false;
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setProfile({
        age: Number(age),
        sex: sex!,
        weight: Number(weight),
        targetAge: Number(targetAge),
        activityLevel: activityLevel!,
      });
      completeOnboarding();
      router.replace('/goals');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.heroTitle}>Backcast</Text>
            <Text style={styles.heroSubtitle}>
              What do you want your body to be capable of{'\n'}the day before you take your last breath?
            </Text>
            <Text style={styles.bodyText}>
              This app uses backcasting — working backwards from the future you want — to show you
              what your body needs to be doing right now.
            </Text>
            <Text style={styles.bodyText}>
              Based on Peter Attia's Centenarian Decathlon framework.
            </Text>
            <View style={styles.caveatBox}>
              <Text style={styles.caveatTitle}>A few things to know</Text>
              <Text style={styles.caveatText}>
                This app uses 8% per decade decline if you tell it you're active, and 13% if you
                tell it you're sedentary. The active rate matches research on trained adults
                (Fitzgerald 1997 found ~5% per decade for VO2 max in trained individuals;
                Wroblewski 2011 found minimal strength loss in master's athletes through age 81).
                The sedentary rate matches population averages for adults who don't train.
              </Text>
              <Text style={styles.caveatText}>
                These numbers are a compass, not a GPS. They're guideposts to help you think ahead
                — not pass/fail grades. Your real curve will have ups, downs, injuries, and life
                events.
              </Text>
              <Text style={styles.caveatText}>
                This is not medical advice. The creator is not a medical professional. Do your own
                research and talk to your doctor. This is a tool to motivate and help you think
                about your future self.
              </Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How old are you?</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="41"
              placeholderTextColor="#555"
              maxLength={3}
              autoFocus
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Biological sex</Text>
            <Text style={styles.stepSubtitle}>
              This affects baseline strength and decline rate calculations.
            </Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.optionButton, sex === 'female' && styles.optionSelected]}
                onPress={() => setSex('female')}
              >
                <Text
                  style={[styles.optionText, sex === 'female' && styles.optionTextSelected]}
                >
                  Female
                </Text>
              </Pressable>
              <Pressable
                style={[styles.optionButton, sex === 'male' && styles.optionSelected]}
                onPress={() => setSex('male')}
              >
                <Text
                  style={[styles.optionText, sex === 'male' && styles.optionTextSelected]}
                >
                  Male
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Current weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
                placeholder="155"
                placeholderTextColor="#555"
                maxLength={3}
                autoFocus
              />
              <Text style={styles.unitText}>lbs</Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How active are you right now?</Text>
            <Text style={styles.stepSubtitle}>
              This sets the decline rate the app uses to calculate your targets. You can think
              of "active" as 150+ minutes a week of moderate exercise, or regular strength work.
            </Text>
            <View style={styles.activityColumn}>
              <Pressable
                style={[
                  styles.activityCard,
                  activityLevel === 'active' && styles.optionSelected,
                ]}
                onPress={() => setActivityLevel('active')}
              >
                <Text
                  style={[
                    styles.activityTitle,
                    activityLevel === 'active' && styles.optionTextSelected,
                  ]}
                >
                  Active
                </Text>
                <Text style={styles.activityBody}>
                  8% decline per decade — research on trained adults (Fitzgerald 1997, Wroblewski
                  2011).
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.activityCard,
                  activityLevel === 'sedentary' && styles.optionSelected,
                ]}
                onPress={() => setActivityLevel('sedentary')}
              >
                <Text
                  style={[
                    styles.activityTitle,
                    activityLevel === 'sedentary' && styles.optionTextSelected,
                  ]}
                >
                  Sedentary
                </Text>
                <Text style={styles.activityBody}>
                  13% decline per decade — population averages for adults who don't train
                  regularly.
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What age are you planning for?</Text>
            <Text style={styles.stepSubtitle}>
              What age do you want to still be doing these things?
            </Text>
            <TextInput
              style={styles.input}
              value={targetAge}
              onChangeText={setTargetAge}
              keyboardType="number-pad"
              placeholder="80"
              placeholderTextColor="#555"
              maxLength={3}
              autoFocus
            />
            <View style={styles.ageHints}>
              {[75, 80, 85, 90, 100].map((a) => (
                <Pressable
                  key={a}
                  style={[
                    styles.ageChip,
                    Number(targetAge) === a && styles.ageChipSelected,
                  ]}
                  onPress={() => setTargetAge(String(a))}
                >
                  <Text
                    style={[
                      styles.ageChipText,
                      Number(targetAge) === a && styles.ageChipTextSelected,
                    ]}
                  >
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Pressable
          style={[styles.button, !canProceed() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.buttonText}>
            {step === 0 ? "Let's go" : step === 5 ? 'Choose your goals' : 'Next'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#B0B4BA',
    lineHeight: 28,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
    marginBottom: 12,
  },
  caveatBox: {
    marginTop: 20,
    backgroundColor: '#151520',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  caveatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B4BA',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caveatText: {
    fontSize: 13,
    color: '#777',
    lineHeight: 20,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  unitText: {
    fontSize: 24,
    color: '#666',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#1A2A3F',
  },
  optionText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#4A9EFF',
  },
  activityColumn: {
    marginTop: 16,
    gap: 12,
  },
  activityCard: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  activityTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 6,
  },
  activityBody: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  ageHints: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    flexWrap: 'wrap',
  },
  ageChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  ageChipSelected: {
    borderColor: '#4A9EFF',
    backgroundColor: '#1A2A3F',
  },
  ageChipText: {
    fontSize: 16,
    color: '#888',
  },
  ageChipTextSelected: {
    color: '#4A9EFF',
  },
  button: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
