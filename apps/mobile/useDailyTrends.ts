import { useCallback, useState } from 'react';
import { getMobileSupabaseClient } from './mobileSupabaseAuth';

export interface DailySummaryTrend {
  date: string;
  resting_heart_rate: number | null;
  sleep_duration_seconds: number | null;
}

export function useDailyTrends() {
  const [trends, setTrends] = useState<DailySummaryTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (wearableSourceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getMobileSupabaseClient();
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
      
      const { data, error: fetchError } = await supabase
        .from('wearable_daily_summaries')
        .select('summary_date, summary_key, value_numeric')
        .eq('wearable_source_id', wearableSourceId)
        .gte('summary_date', sevenDaysAgo)
        .in('summary_key', ['resting_heart_rate', 'sleep_duration'])
        .order('summary_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Group by date
      const byDate: Record<string, DailySummaryTrend> = {};
      (data ?? []).forEach(row => {
        if (!byDate[row.summary_date]) {
          byDate[row.summary_date] = { date: row.summary_date, resting_heart_rate: null, sleep_duration_seconds: null };
        }
        if (row.summary_key === 'resting_heart_rate') {
          byDate[row.summary_date].resting_heart_rate = row.value_numeric;
        } else if (row.summary_key === 'sleep_duration') {
          // Assuming sleep_duration is stored in minutes in the DB (based on wearable_metric_definitions), convert to seconds for the UI or keep as is.
          // Let's just use it directly, renaming property to sleep_duration_minutes to be safe.
          byDate[row.summary_date].sleep_duration_seconds = row.value_numeric ? row.value_numeric * 60 : null;
        }
      });

      setTrends(Object.values(byDate));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { trends, isLoading, error, fetchTrends };
}
