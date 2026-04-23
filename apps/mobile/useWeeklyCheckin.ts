import { useCallback, useState } from 'react';
import { getMobileSupabaseClient } from './mobileSupabaseAuth';

export interface WeeklyCheckinPayload {
  week_date: string; // YYYY-MM-DD
  exercise_score: number;
  sleep_score: number;
  nutrition_score: number;
  emotional_health_score: number;
  bottleneck: string;
  biggest_risk: string;
  intended_action: string;
}

export function useWeeklyCheckin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitCheckin = useCallback(async (payload: WeeklyCheckinPayload) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = getMobileSupabaseClient();
      
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        throw new Error('You must be logged in to submit a check-in.');
      }

      const profile_id = userData.user.id;

      const { error: insertError } = await supabase
        .from('weekly_checkins')
        .upsert({
          profile_id,
          ...payload,
        }, { onConflict: 'profile_id, week_date' });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to submit weekly check-in');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, success, submitCheckin };
}
