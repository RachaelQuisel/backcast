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
            This app uses an 8% decline per decade rate, applied to Peter Attia's Centenarian
            Decathlon target values at age 100. The 8% rate aligns with what the research shows
            for adults who keep moving.
          </Text>
          <Text style={styles.body}>
            Fitzgerald et al. (1997) found VO2 max declines about 5% per decade in trained adults
            versus 10% in sedentary ones. Wroblewski et al. (2011) found no significant
            strength or muscle decline in master's athletes through age 81.
          </Text>
          <Text style={styles.body}>
            8% sits between "trained" and "sedentary" — assuming you're staying reasonably
            active. If you train harder than that, you'll outperform these targets. If you're
            sedentary, the targets understate what you'll need to make up later.
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
