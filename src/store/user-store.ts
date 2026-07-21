import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ensureSession } from '@/lib/auth';
import {
  ActivityLevel,
  DEFAULT_ACTIVITY_LEVEL,
} from '@/constants/exercises';

/**
 * A user's custom override for one exercise's target-at-targetAge.
 * `targetAge` and `activityLevel` are stamped at write time so a later change
 * to either doesn't silently re-anchor the commitment to a new horizon or
 * a new decline rate.
 */
export interface CustomTarget {
  value: number;
  targetAge: number;
  activityLevel: ActivityLevel;
}

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

/**
 * Legacy `custom_targets` from before the targetAge fix were stored as plain
 * numbers — under the old code those were normalized to Attia's age-100 form.
 * New rows store `{value, targetAge, activityLevel}`.
 *
 * We stamp legacy entries as `targetAge: 100, activityLevel: current`. This
 * is the literal meaning of the legacy data (the number IS the age-100
 * value). If the user's current targetAge or activityLevel differs, the
 * dashboard's stale-target UX fires and prompts a re-set — no silent
 * re-anchoring of the commitment to a new horizon.
 */
function migrateCustomTargets(
  raw: unknown,
  activityLevel: ActivityLevel
): { customTargets: Record<string, CustomTarget>; migrated: boolean } {
  if (!raw || typeof raw !== 'object') {
    return { customTargets: {}, migrated: false };
  }
  const out: Record<string, CustomTarget> = {};
  let migrated = false;
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof entry === 'number') {
      out[id] = { value: entry, targetAge: 100, activityLevel };
      migrated = true;
    } else if (
      entry && typeof entry === 'object' &&
      typeof (entry as Partial<CustomTarget>).value === 'number' &&
      typeof (entry as Partial<CustomTarget>).targetAge === 'number'
    ) {
      const e = entry as Partial<CustomTarget>;
      // Add activityLevel stamp to entries stored before that field existed.
      if (e.activityLevel === 'active' || e.activityLevel === 'sedentary') {
        out[id] = { value: e.value!, targetAge: e.targetAge!, activityLevel: e.activityLevel };
      } else {
        out[id] = { value: e.value!, targetAge: e.targetAge!, activityLevel };
        migrated = true;
      }
    }
  }
  return { customTargets: out, migrated };
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

  // Custom targets: exercise ID → user's chosen value at the stamped targetAge
  customTargets: Record<string, CustomTarget>;

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
  setActivityLevel: (level: ActivityLevel) => void;
  setSelectedGoals: (goals: string[]) => void;
  toggleGoal: (exerciseId: string) => void;
  setCustomTarget: (
    exerciseId: string,
    value: number,
    targetAge: number,
    activityLevel: ActivityLevel
  ) => void;
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
          const targetAge = profile.target_age ?? 80;
          const activityLevel =
            (profile.activity_level as ActivityLevel) ?? DEFAULT_ACTIVITY_LEVEL;
          const { customTargets, migrated } = migrateCustomTargets(
            profile.custom_targets,
            activityLevel
          );
          set({
            age: profile.age,
            sex: profile.sex as 'male' | 'female' | null,
            weight: profile.weight,
            targetAge,
            activityLevel,
            selectedGoals: profile.selected_goals ?? [],
            customTargets,
            hasOnboarded: profile.has_onboarded ?? false,
          });

          if (migrated) {
            catchSync('Custom-target migration sync', supabase
              .from('profiles')
              .update({ custom_targets: customTargets })
              .eq('id', userId));
          }
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

  setActivityLevel: (level) => {
    set({ activityLevel: level });

    const userId = get().userId;
    if (userId) {
      catchSync('Activity level sync', supabase
        .from('profiles')
        .update({ activity_level: level })
        .eq('id', userId));
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

  setCustomTarget: (exerciseId, value, targetAge, activityLevel) => {
    const updated = {
      ...get().customTargets,
      [exerciseId]: { value, targetAge, activityLevel },
    };
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
