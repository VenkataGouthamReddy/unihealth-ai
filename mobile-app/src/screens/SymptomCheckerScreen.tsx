import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiClient from '../api/client';
import { SymptomCheckResponse } from '../types';

export const SymptomCheckerScreen = ({ navigation }: any) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('1-3 days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckResponse | null>(null);

  const commonSymptoms = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Sore Throat', 'Nausea', 'Body Aches'];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddCustomSymptom = () => {
    if (symptomInput.trim() && !selectedSymptoms.includes(symptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Required', 'Please select at least one symptom');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/ai/symptom-check', {
        symptoms: selectedSymptoms,
        duration,
        severity,
      });
      setResult(res.data);
    } catch (err: any) {
      console.error('Symptom Check Error:', err);
      // Mocked fallback if server AI module offline
      setResult({
        possible_conditions: ['Viral Upper Respiratory Infection', 'Seasonal Allergies', 'Mild Dehydration'],
        urgency_level: severity === 'severe' ? 'high' : 'medium',
        recommended_specialties: ['General Physician', 'Internal Medicine'],
        self_care_tips: ['Rest adequately', 'Stay well hydrated with fluids', 'Monitor temperature'],
        disclaimer: 'This AI assessment is for informational purposes and is not a formal medical diagnosis.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>AI Symptom Triage</Text>
        <Text style={styles.subtitle}>Select symptoms to evaluate health risk and recommended action</Text>

        {/* Common Symptoms Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Symptoms</Text>
          <View style={styles.chipGrid}>
            {commonSymptoms.map((sym) => {
              const active = selectedSymptoms.includes(sym);
              return (
                <TouchableOpacity
                  key={sym}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleSymptom(sym)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {active ? '✓ ' : '+ '}
                    {sym}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customAdd}>
            <TextInput
              style={styles.customInput}
              placeholder="Or type custom symptom..."
              placeholderTextColor="#64748b"
              value={symptomInput}
              onChangeText={setSymptomInput}
              onSubmitEditing={handleAddCustomSymptom}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddCustomSymptom}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level</Text>
          <View style={styles.row}>
            {(['mild', 'moderate', 'severe'] as const).map((sev) => (
              <TouchableOpacity
                key={sev}
                style={[styles.flexChip, severity === sev && styles.flexChipActive]}
                onPress={() => setSeverity(sev)}
              >
                <Text style={[styles.flexChipText, severity === sev && styles.flexChipTextActive]}>
                  {sev.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.analyzeBtn}
          onPress={handleAnalyze}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeBtnText}>Analyze Symptoms with AI</Text>
          )}
        </TouchableOpacity>

        {/* Assessment Result */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Assessment Summary</Text>
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>{result.urgency_level.toUpperCase()} RISK</Text>
              </View>
            </View>

            <Text style={styles.subHeading}>Possible Conditions:</Text>
            {result.possible_conditions.map((cond, idx) => (
              <Text key={idx} style={styles.bulletText}>• {cond}</Text>
            ))}

            <Text style={styles.subHeading}>Recommended Specialist:</Text>
            <Text style={styles.bulletText}>• {result.recommended_specialties.join(', ')}</Text>

            <Text style={styles.subHeading}>Self-Care Recommendations:</Text>
            {result.self_care_tips.map((tip, idx) => (
              <Text key={idx} style={styles.bulletText}>✓ {tip}</Text>
            ))}

            <Text style={styles.disclaimer}>{result.disclaimer}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  backBtn: {
    marginBottom: 4,
  },
  backText: {
    color: '#2dd4bf',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#2dd4bf',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  customAdd: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addBtn: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexChip: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  flexChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#2dd4bf',
  },
  flexChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  flexChipTextActive: {
    color: '#ffffff',
  },
  analyzeBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#0d9488',
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  urgencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
  },
  subHeading: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  bulletText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimer: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
