import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ensureSession } from '@/lib/auth';
import { ActivityLevel, DEFAULT_ACTIVITY_LEVEL } from '@/constants/exercises';

// Dedupes concurrent initialize() calls (e.g. Strict Mode double-mount)
// so we don't create two anonymous users on first launch.
let initPromise: Promise<void> | null = null;

/** Swallow network/unexpected errors on fire-and-forget Supabase calls */
function catchSync(label: string, promise: PromiseLike<{ error: { message: string } | null }>) {
  promise
    .then(({ error }) => {
      if (error) console.error(`${label}:`, error.message);
    })
    // Catch network errors, timeouts, etc.
    .then(undefined, (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`${label} (exception):`, message);
    });
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  value: number;
  loggedAt: string; // ISO date string
}

interface UserState {
  // Auth
  userId: string | null;
  isLoading: boolean;

  // Profile
  age: number | null;
  sex: 'male' | 'female' | null;
  weight: number | null; // lbs
  targetAge: number;
  activityLevel: ActivityLevel;
  hasOnboarded: boolean;

  // Selected goals (exercise IDs the user cares about)
  selectedGoals: string[];

  // Custom targets: exercise ID → user's chosen base value at age 100
  customTargets: Record<string, number>;

  // Workout logs
  logs: WorkoutLog[];

  // Actions
  initialize: () => Promise<void>;
  setProfile: (profile: {
    age: number;
    sex: 'male' | 'female';
    weight: number;
    targetAge?: number;
    activityLevel?: ActivityLevel;
  }) => void;
  setSelectedGoals: (goals: string[]) => void;
  toggleGoal: (exerciseId: string) => void;
  setCustomTarget: (exerciseId: string, valueAt100: number) => void;
  addLog: (log: Omit<WorkoutLog, 'id'>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userId: null,
  isLoading: true,

  age: null,
  sex: null,
  weight: null,
  targetAge: 80,
  activityLevel: DEFAULT_ACTIVITY_LEVEL,
  hasOnboarded: false,
  selectedGoals: [],
  customTargets: {},
  logs: [],

  initialize: async () => {
    if (get().userId && !get().isLoading) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      set({ isLoading: true });

      try {
        const userId = await ensureSession();
        if (!userId) return;

        set({ userId });

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          set({
            age: profile.age,
            sex: profile.sex as 'male' | 'female' | null,
            weight: profile.weight,
            targetAge: profile.target_age ?? 80,
            activityLevel: (profile.activity_level as ActivityLevel) ?? DEFAULT_ACTIVITY_LEVEL,
            selectedGoals: profile.selected_goals ?? [],
            customTargets: profile.custom_targets ?? {},
            hasOnboarded: profile.has_onboarded ?? false,
          });
        }

        const { data: logs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false });

        if (logs) {
          set({
            logs: logs.map((l) => ({
              id: l.id,
              exerciseId: l.exercise_id,
              value: Number(l.value),
              loggedAt: l.logged_at,
            })),
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Initialize failed:', message);
      } finally {
        set({ isLoading: false });
        // Allow retry after failure; success is guarded by the userId check above.
        initPromise = null;
      }
    })();

    return initPromise;
  },

  setProfile: (profile) => {
    const targetAge = profile.targetAge ?? 80;
    const activityLevel = profile.activityLevel ?? get().activityLevel;
    set({
      age: profile.age,
      sex: profile.sex,
      weight: profile.weight,
      targetAge,
      activityLevel,
    });

    const userId = get().userId;
    if (userId) {
      catchSync('Profile sync', supabase
        .from('profiles')
        .upsert({
          id: userId,
          age: profile.age,
          sex: profile.sex,
          weight: profile.weight,
          target_age: targetAge,
          activity_level: activityLevel,
        }));
    }
  },

  setSelectedGoals: (goals) => {
    set({ selectedGoals: goals });

    const userId = get().userId;
    if (userId) {
      catchSync('Goals sync', supabase
        .from('profiles')
        .update({ selected_goals: goals })
        .eq('id', userId));
    }
  },

  toggleGoal: (exerciseId) => {
    const current = get().selectedGoals;
    const updated = current.includes(exerciseId)
      ? current.filter((id) => id !== exerciseId)
      : [...current, exerciseId];

    set({ selectedGoals: updated });

    const userId = get().userId;
    if (userId) {
      catchSync('Toggle goal sync', supabase
        .from('profiles')
        .update({ selected_goals: updated })
        .eq('id', userId));
    }
  },

  setCustomTarget: (exerciseId, valueAt100) => {
    const updated = { ...get().customTargets, [exerciseId]: valueAt100 };
    set({ customTargets: updated });

    const userId = get().userId;
    if (userId) {
      catchSync('Custom target sync', supabase
        .from('profiles')
        .update({ custom_targets: updated })
        .eq('id', userId));
    }
  },

  addLog: (log) => {
    const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newLog: WorkoutLog = { ...log, id: localId };

    set((state) => ({
      logs: [newLog, ...state.logs],
    }));

    const userId = get().userId;
    if (!userId) return;

    const rollback = () => {
      set((state) => ({
        logs: state.logs.filter((l) => l.id !== localId),
      }));
    };

    supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        exercise_id: log.exerciseId,
        value: log.value,
        logged_at: log.loggedAt,
      })
      .select('id')
      .single()
      .then(
        ({ data, error }) => {
          if (error) {
            console.error('Log sync:', error.message);
            rollback();
          } else if (data) {
            set((state) => ({
              logs: state.logs.map((l) =>
                l.id === localId ? { ...l, id: data.id } : l
              ),
            }));
          }
        },
        (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('Log sync (exception):', message);
          rollback();
        }
      );
  },

  completeOnboarding: () => {
    set({ hasOnboarded: true });

    const userId = get().userId;
    if (userId) {
      catchSync('Onboarding sync', supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', userId));
    }
  },

  reset: () => {
    set({
      age: null,
      sex: null,
      weight: null,
      targetAge: 80,
      activityLevel: DEFAULT_ACTIVITY_LEVEL,
      hasOnboarded: false,
      selectedGoals: [],
      customTargets: {},
      logs: [],
    });

    const userId = get().userId;
    if (userId) {
      // Delete logs first, then profile
      supabase
        .from('workout_logs')
        .delete()
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) console.error('Reset logs:', error.message);
          return supabase.from('profiles').delete().eq('id', userId);
        })
        .then(
          ({ error }) => {
            if (error) console.error('Reset profile:', error.message);
          },
          (err: unknown) => {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Reset (exception):', message);
          }
        );
    }
  },
}));
