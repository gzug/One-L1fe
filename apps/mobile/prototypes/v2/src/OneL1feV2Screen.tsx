import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { useWebBackground } from './theme/useWebBackground';
import { ProfileScreen } from '../../v1-marathon/src/components/ProfileScreen';
import { BloodResultsScreen } from '../../v1-marathon/src/screens/BloodResultsScreen';
import { ThemeProvider as LegacyV1ThemeProvider } from '../../v1-marathon/src/theme/ThemeContext';
import { BottomNavV2, type BottomTabKey } from './components/BottomNavV2';
import { HomeScreen } from './screens/HomeScreen';
import { TrendsScreen } from './screens/TrendsScreen';
import { prototypeCopy } from './data/copy';
import { getHomeDisplayData } from './data/homeDataAdapter';
import type { HomeDataMode } from './data/homeTypes';
import { DEFAULT_TIME_RANGE } from './types/timeRange';
import type { CustomRange, TimeRange } from './types/timeRange';
import { layout, lineHeights, radius, spacing, typography } from './theme/marathonTheme';

export function OneL1feV2Screen() {
  return (
    <ThemeProvider>
      <V2Shell />
    </ThemeProvider>
  );
}

type ActiveView = BottomTabKey | 'blood';

function V2Shell() {
  const { colors } = useTheme();
  const [activeView, setActiveView]           = useState<ActiveView>('home');
  const [demoInfoVisible, setDemoInfoVisible] = useState(false);

  // Shared data state for Trends (and any future cross-tab consumer).
  // HomeScreen manages its own internal copy; Trends reads from here.
  const [dataMode, setDataMode]       = useState<HomeDataMode>('demo');
  const [timeRange, setTimeRange]     = useState<TimeRange>(DEFAULT_TIME_RANGE);
  const [customRange, setCustomRange] = useState<CustomRange>({ start: null, end: null });

  useWebBackground(colors.background);

  // Compute display data for tabs that consume it (Trends, future Insights).
  // HomeScreen computes its own copy internally to keep its adapter
  // boundary intact (bloodPanels, HealthConnect status, etc.).
  const trendsData = getHomeDisplayData({
    mode: dataMode,
    timeRange,
    customRange,
    bloodPanels: [],
  });

  function openProfile() {
    setDemoInfoVisible(false);
    setActiveView('profile');
  }

  function selectTab(tab: BottomTabKey) {
    setDemoInfoVisible(false);
    setActiveView(tab);
  }

  return (
    <>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'blood' ? (
            <LegacyV1ThemeProvider>
              <BloodResultsScreen onClose={() => setActiveView('home')} />
            </LegacyV1ThemeProvider>
          ) : activeView === 'profile' ? (
            <LegacyV1ThemeProvider>
              <ProfileScreen
                onClose={() => setActiveView('home')}
                onViewBlood={() => setActiveView('blood')}
              />
            </LegacyV1ThemeProvider>
          ) : activeView === 'trends' ? (
            <TrendsScreen data={trendsData} />
          ) : activeView === 'insights' ? (
            <TopLevelPlaceholder
              title="Insights"
              subtitle="Insights will summarize patterns from your connected data."
            />
          ) : (
            // HomeScreen owns its own state (bloodPanels, HealthConnect, mode, range, etc.)
            <HomeScreen
              onProfilePress={() => setActiveView('profile')}
              onDemoInfoPress={() => setDemoInfoVisible(true)}
              onViewBloodPanels={() => setActiveView('blood')}
              onManageSources={() => setActiveView('profile')}
            />
          )}
        </View>

        {activeView !== 'blood' ? (
          <BottomNavV2 activeTab={activeView} onSelect={selectTab} />
        ) : null}
      </SafeAreaView>

      <Modal
        visible={demoInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoInfoVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDemoInfoVisible(false)}>
          <View style={demoOverlay.backdrop}>
            <TouchableWithoutFeedback onPress={() => { /* absorb */ }}>
              <View
                style={[
                  demoOverlay.sheet,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Text style={[demoOverlay.infoGlyph, { color: colors.accent }]}>i</Text>
                <Text style={[demoOverlay.title, { color: colors.text }]}>
                  {prototypeCopy.demoInfoTitle}
                </Text>
                <Text style={[demoOverlay.body, { color: colors.textMuted }]}>
                  {prototypeCopy.demoInfoBody}
                </Text>
                <View style={[demoOverlay.divider, { backgroundColor: colors.borderSubtle }]} />
                <Text style={[demoOverlay.helperText, { color: colors.textSubtle }]}>
                  {prototypeCopy.demoInfoConnectHelper}
                </Text>
                <Pressable
                  onPress={openProfile}
                  style={[
                    demoOverlay.connectBtn,
                    { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
                  ]}
                  accessibilityLabel="Connect a source"
                >
                  <Text style={[demoOverlay.connectIcon, { color: colors.accent }]}>↗</Text>
                  <Text style={[demoOverlay.connectBtnText, { color: colors.accent }]}>
                    {prototypeCopy.demoInfoConnectCta}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDemoInfoVisible(false)}
                  style={demoOverlay.dismissBtn}
                >
                  <Text style={[demoOverlay.dismissText, { color: colors.textSubtle }]}>
                    {prototypeCopy.demoInfoDismiss}
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function TopLevelPlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[placeholderStyles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          placeholderStyles.card,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[placeholderStyles.eyebrow, { color: colors.textSubtle }]}>Coming soon</Text>
        <Text style={[placeholderStyles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[placeholderStyles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const demoOverlay = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  infoGlyph: {
    alignSelf: 'center',
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    textAlign: 'center',
  },
  divider: { height: 1, marginVertical: spacing.xs },
  helperText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    textAlign: 'center',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  connectIcon: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
  },
  connectBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  dismissBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  dismissText: { fontSize: typography.caption, fontWeight: '500' },
});

const placeholderStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: layout.maxWidth,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.heroName,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
  },
});

export default OneL1feV2Screen;
