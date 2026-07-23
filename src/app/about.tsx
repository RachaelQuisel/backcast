import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SOURCES = [
  {
    title: 'Wroblewski et al. (2011) — Master\'s athletes show no significant muscle/strength decline age 40-81',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22030953/',
  },
  {
    title: 'Fitzgerald et al. (1997) — VO2 max decline: 10%/decade sedentary, 5%/decade active',
    url: 'https://pubmed.ncbi.nlm.nih.gov/9216960/',
  },
  {
    title: 'Fleg et al. (2005) — Accelerated VO2 max decline with aging (Baltimore Longitudinal Study)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16061756/',
  },
  {
    title: 'Tanaka & Seals (2008) — Endurance exercise performance in master\'s athletes',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2375571/',
  },
  {
    title: 'Mandsager et al. (2018) — Cardiorespiratory fitness and mortality (122,007 patients)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30349068/',
  },
  {
    title: 'Peter Attia — Training for the Centenarian Decathlon',
    url: 'https://peterattiamd.com/training-for-the-centenarian-decathlon/',
  },
  {
    title: 'Annie Duke — Backcasting framework (The Peter Attia Drive #60)',
    url: 'https://peterattiamd.com/annieduke/',
  },
];

export default function About() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>About Backcast</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What this app does</Text>
          <Text style={styles.body}>
            Backcast uses a concept called backcasting — working backwards from the future you
            want — to calculate what your body needs to be capable of right now.
          </Text>
          <Text style={styles.body}>
            Pick the things you want to do at 80 (or 90, or 100), and the app shows you the
            strength and fitness targets you should be hitting today. Then track your progress
            over time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How the math works</Text>
          <Text style={styles.body}>
            This app uses Peter Attia's Centenarian Decathlon thresholds — the strength and
            fitness levels Attia argues are needed for an independent old age. You pick when
            you want to still be capable of those thresholds (age 70, 80, 90, or 100), and the
            app backcasts using a compound decline rate that depends on the activity level you
            chose during onboarding:
          </Text>
          <Text style={styles.body}>
            • <Text style={styles.bodyEmphasis}>Active: 8% per decade.</Text> Aligns with research
            on trained adults — Fitzgerald et al. (1997) found ~5% per decade for VO2 max in
            trained individuals; Wroblewski et al. (2011) found minimal strength loss in master's
            athletes through age 81.
          </Text>
          <Text style={styles.body}>
            • <Text style={styles.bodyEmphasis}>Sedentary: 13% per decade.</Text> Closer to
            population averages for adults who don't train regularly (Pollock 1997; sedentary
            cohorts in Fitzgerald 1997).
          </Text>
          <Text style={styles.body}>
            If you're not sure which fits you, "active" generally means 150+ minutes a week of
            moderate exercise, or regular strength training. The targets are guideposts either
            way — change activity level any time and the math will recalibrate.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important caveats</Text>
          <Text style={styles.body}>
            The creator of this app is not a medical professional. This app is not medical
            advice. It is a motivational tool designed to help you think ahead about your
            physical future.
          </Text>
          <Text style={styles.body}>
            These targets are guideposts, not pass/fail grades. Your real trajectory will have
            ups, downs, injuries, illness, and life events. The decline is not a smooth curve —
            it's fits and bumps.
          </Text>
          <Text style={styles.body}>
            Don't treat these numbers as ceilings ("I hit my target, I can relax") or floors
            ("I'm behind, why bother"). The value is in having a direction.
          </Text>
          <Text style={styles.body}>
            Do your own research. Talk to your doctor. Use this as one tool among many.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sources & further reading</Text>
          {SOURCES.map((source, i) => (
            <Pressable
              key={i}
              style={styles.sourceRow}
              onPress={() => Linking.openURL(source.url)}
            >
              <Text style={styles.sourceText}>{source.title}</Text>
              <Text style={styles.sourceLink}>↗</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image credits</Text>
          <Text style={styles.body}>
            Exercise photos come from Wikimedia Commons. Overhead Press and
            Farmer's Walk are U.S. military public-domain photos by Airman
            1st Class Jovante Johnson (U.S. Air Force) and Lance Cpl. David
            N. Hersey (U.S. Marine Corps). Dead Lift is by mark sebastian
            (CC BY-SA 2.0). Turkish Get-Up is by Nenad Stojkovic (CC BY
            2.0). Front Squat is by Simon Q (CC BY 2.0).
          </Text>
          <Text style={styles.body}>
            Full license text and canonical source URLs live in
            LICENSES-thirdparty.md in the repository.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The backcasting philosophy</Text>
          <Text style={styles.quote}>
            "What do you want your body to function like the day before you take your last
            breath?"
          </Text>
          <Text style={styles.quoteAttr}>— Peter Attia</Text>
          <Text style={styles.body}>
            The backcasting framework comes from decision strategist Annie Duke. Instead of
            forecasting where you're headed, you imagine the future you want and work backwards
            to figure out what has to be true right now.
          </Text>
          <Text style={styles.body}>
            This isn't a prediction about your decline. It's a decision about your present.
          </Text>
        </View>
      </ScrollView>
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
  backButton: {
    paddingVertical: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4A9EFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 28,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: '#999',
    lineHeight: 24,
    marginBottom: 10,
  },
  bodyEmphasis: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quote: {
    fontSize: 17,
    color: '#CCC',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 4,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4A9EFF',
  },
  quoteAttr: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingLeft: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
    gap: 8,
  },
  sourceText: {
    flex: 1,
    fontSize: 14,
    color: '#4A9EFF',
    lineHeight: 20,
  },
  sourceLink: {
    fontSize: 14,
    color: '#666',
  },
});
