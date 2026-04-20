import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMobileSupabaseClient } from './mobileSupabaseAuth.ts';

interface DevErrorLog {
  id: string;
  error_message: string;
  error_stack?: string;
  screen?: string;
  app_version?: string;
  platform?: string;
  created_at: string;
}

interface DevFeedback {
  id: string;
  category: 'bug' | 'idea' | 'question';
  body: string;
  screen?: string;
  created_at: string;
}

interface DevMetrics {
  active_users_7d: number;
  sync_runs_24h: number;
  errors_24h: number;
  last_sync_per_user: Record<string, string>;
}

type TabType = 'errors' | 'feedback' | 'metrics';

interface DevInsightScreenProps {
  profileId: string;
}

export default function DevInsightScreen({
  profileId,
}: DevInsightScreenProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('errors');
  const [errors, setErrors] = useState<DevErrorLog[]>([]);
  const [feedback, setFeedback] = useState<DevFeedback[]>([]);
  const [metrics, setMetrics] = useState<DevMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<DevErrorLog | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'idea' | 'question'>('bug');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [feedbackScreen, setFeedbackScreen] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const supabase = getMobileSupabaseClient();

  useEffect(() => {
    void loadData();
  }, [activeTab]);

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (activeTab === 'errors') {
        const { data, error } = await supabase
          .from('dev_error_log')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setErrors(data as DevErrorLog[]);
        }
      } else if (activeTab === 'feedback') {
        const { data, error } = await supabase
          .from('dev_feedback')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setFeedback(data as DevFeedback[]);
        }
      } else if (activeTab === 'metrics') {
        await loadMetrics();
      }
    } catch (e) {
      console.error('Error loading dev data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, profileId, supabase]);

  const loadMetrics = useCallback(async (): Promise<void> => {
    try {
      const { data: syncData, error: syncError } = await supabase
        .from('wearable_sync_runs')
        .select('id, status, started_at, completed_at, profile_id');

      if (syncError) {
        console.error('Error loading metrics:', syncError);
        return;
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const activeUsers = new Set<string>();
      let syncRuns24h = 0;
      let errors24h = 0;
      const lastSyncMap: Record<string, string> = {};

      if (Array.isArray(syncData)) {
        for (const run of syncData) {
          const startedAt = new Date(run.started_at);

          if (startedAt > sevenDaysAgo) {
            activeUsers.add(run.profile_id);
          }

          if (startedAt > oneDayAgo) {
            syncRuns24h += 1;
            if (run.status === 'failed') {
              errors24h += 1;
            }

            if (run.status === 'success' && run.completed_at) {
              const completedDate = new Date(run.completed_at).toISOString();
              if (!lastSyncMap[run.profile_id] || completedDate > lastSyncMap[run.profile_id]) {
                lastSyncMap[run.profile_id] = completedDate;
              }
            }
          }
        }
      }

      setMetrics({
        active_users_7d: activeUsers.size,
        sync_runs_24h: syncRuns24h,
        errors_24h: errors24h,
        last_sync_per_user: lastSyncMap,
      });
    } catch (e) {
      console.error('Error computing metrics:', e);
    }
  }, [supabase]);

  const handleSubmitFeedback = useCallback(async (): Promise<void> => {
    if (!feedbackBody.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase.from('dev_feedback').insert({
        profile_id: profileId,
        category: feedbackCategory,
        body: feedbackBody.trim(),
        screen: feedbackScreen.trim() || null,
      });

      if (!error) {
        setFeedbackBody('');
        setFeedbackScreen('');
        setFeedbackCategory('bug');
        void loadData();
      }
    } catch (e) {
      console.error('Error submitting feedback:', e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [feedbackCategory, feedbackBody, feedbackScreen, profileId, supabase, loadData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dev Insight</Text>
      </View>

      <View style={styles.tabBar}>
        {['errors', 'feedback', 'metrics'].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab as TabType)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator>
          {activeTab === 'errors' && (
            <View>
              {errors.length === 0 ? (
                <Text style={styles.emptyText}>No errors logged</Text>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={errors}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setSelectedError(item)}
                      style={styles.errorItem}
                    >
                      <Text style={styles.errorMessage}>{item.error_message}</Text>
                      <Text style={styles.errorMeta}>
                        {item.screen && `Screen: ${item.screen}`}
                        {item.app_version && ` | v${item.app_version}`}
                      </Text>
                      <Text style={styles.errorTime}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </Pressable>
                  )}
                />
              )}
            </View>
          )}

          {activeTab === 'feedback' && (
            <View>
              <View style={styles.feedbackForm}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['bug', 'idea', 'question'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setFeedbackCategory(cat as 'bug' | 'idea' | 'question')}
                      style={[
                        styles.categoryButton,
                        feedbackCategory === cat && styles.categoryButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          feedbackCategory === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>Screen (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Screen name"
                  value={feedbackScreen}
                  onChangeText={setFeedbackScreen}
                  editable={!isSubmittingFeedback}
                />

                <Text style={styles.formLabel}>Feedback</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Your feedback here..."
                  value={feedbackBody}
                  onChangeText={setFeedbackBody}
                  editable={!isSubmittingFeedback}
                  multiline
                  numberOfLines={4}
                />

                <Pressable
                  onPress={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackBody.trim()}
                  style={[
                    styles.submitButton,
                    (isSubmittingFeedback || !feedbackBody.trim()) && styles.submitButtonDisabled,
                  ]}
                >
                  {isSubmittingFeedback ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  )}
                </Pressable>
              </View>

              {feedback.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recent Feedback</Text>
                  <FlatList
                    scrollEnabled={false}
                    data={feedback}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.feedbackItem}>
                        <Text style={styles.feedbackCategory}>{item.category.toUpperCase()}</Text>
                        <Text style={styles.feedbackBody}>{item.body}</Text>
                        <Text style={styles.feedbackTime}>
                          {new Date(item.created_at).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  />
                </>
              )}
            </View>
          )}

          {activeTab === 'metrics' && (
            <View style={styles.metricsContainer}>
              {metrics ? (
                <>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Active Users (7d)</Text>
                    <Text style={styles.metricValue}>{metrics.active_users_7d}</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Sync Runs (24h)</Text>
                    <Text style={styles.metricValue}>{metrics.sync_runs_24h}</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Errors (24h)</Text>
                    <Text style={styles.metricValue}>{metrics.errors_24h}</Text>
                  </View>

                  {Object.keys(metrics.last_sync_per_user).length > 0 && (
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Last Sync per User</Text>
                      {Object.entries(metrics.last_sync_per_user).map(([userId, timestamp]) => (
                        <Text key={userId} style={styles.metricDetail}>
                          {userId.slice(0, 8)}...: {new Date(timestamp).toLocaleString()}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.emptyText}>No metrics available</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={selectedError !== null}
        animationType="slide"
        onRequestClose={() => setSelectedError(null)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSelectedError(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Error Details</Text>
            <View style={{ width: 60 }} />
          </View>

          {selectedError && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.errorDetail}>
                <Text style={styles.detailLabel}>Message:</Text>
                <Text style={styles.detailValue}>{selectedError.error_message}</Text>
              </View>

              {selectedError.error_stack && (
                <View style={styles.errorDetail}>
                  <Text style={styles.detailLabel}>Stack Trace:</Text>
                  <Text style={styles.detailValue}>{selectedError.error_stack}</Text>
                </View>
              )}

              {selectedError.screen && (
                <View style={styles.errorDetail}>
                  <Text style={styles.detailLabel}>Screen:</Text>
                  <Text style={styles.detailValue}>{selectedError.screen}</Text>
                </View>
              )}

              {selectedError.app_version && (
                <View style={styles.errorDetail}>
                  <Text style={styles.detailLabel}>App Version:</Text>
                  <Text style={styles.detailValue}>{selectedError.app_version}</Text>
                </View>
              )}

              {selectedError.platform && (
                <View style={styles.errorDetail}>
                  <Text style={styles.detailLabel}>Platform:</Text>
                  <Text style={styles.detailValue}>{selectedError.platform}</Text>
                </View>
              )}

              <Text style={styles.detailLabel}>
                Recorded: {new Date(selectedError.created_at).toLocaleString()}
              </Text>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  errorMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  errorTime: {
    fontSize: 11,
    color: '#999',
  },
  feedbackForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  feedbackCategory: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  feedbackBody: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  feedbackTime: {
    fontSize: 11,
    color: '#999',
  },
  metricsContainer: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricDetail: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  errorDetail: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
