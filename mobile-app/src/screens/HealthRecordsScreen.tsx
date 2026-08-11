import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import apiClient from '../api/client';
import { HealthRecord } from '../types';

export const HealthRecordsScreen = ({ navigation }: any) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'prescription' | 'lab_report' | 'checkup'>('all');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reports');
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching health records:', err);
      // Fallback mock records
      setRecords([
        {
          id: 'rec_1',
          title: 'Digital Prescription - Fever & Flu',
          type: 'prescription',
          date: '2026-08-04',
          doctor_name: 'Dr. Sarah Jenkins',
          summary: 'Prescribed Amoxicillin 500mg (Twice daily) & Paracetamol 650mg for acute fever.',
          details: {
            diagnosis: 'Acute Upper Respiratory Tract Infection',
            medicines: [
              { name: 'Amoxicillin 500mg', dosage: '1 Capsule', frequency: 'Twice daily', duration: '5 days' },
              { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'As needed for fever', duration: '3 days' },
            ],
            advice: 'Drink plenty of fluids. Warm saltwater gargles twice daily.',
          },
        },
        {
          id: 'rec_2',
          title: 'Annual Campus Health Checkup',
          type: 'checkup',
          date: '2026-07-20',
          doctor_name: 'Dr. Sarah Jenkins',
          summary: 'Blood pressure normal (118/76), heart rate 72 bpm. Clear lungs & sound heart.',
          details: {
            bp: '118/76 mmHg',
            pulse: '72 bpm',
            weight: '68 kg',
            notes: 'Overall fit. Recommended increasing daily water intake to 2.5L.',
          },
        },
        {
          id: 'rec_3',
          title: 'Blood CBC Panel Results',
          type: 'lab_report',
          date: '2026-06-15',
          doctor_name: 'Dr. Michael Chen',
          summary: 'Hemoglobin 14.5 g/dL, WBC count 6,800 /mcL. All parameters normal.',
          details: {
            lab_name: 'Campus Diagnostic Center',
            hb: '14.5 g/dL (Normal: 13.5-17.5)',
            wbc: '6,800 /mcL (Normal: 4,500-11,000)',
            platelets: '250,000 /mcL (Normal: 150k-450k)',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
        <Text style={styles.subtitle}>Prescriptions, lab reports, and clinical summaries</Text>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {(['all', 'prescription', 'lab_report', 'checkup'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all'
                ? 'All'
                : f === 'prescription'
                ? 'Rx'
                : f === 'lab_report'
                ? 'Labs'
                : 'Checkups'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2dd4bf" />
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Records Found</Text>
          <Text style={styles.emptySub}>No health records under this category.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedRecord(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>
                  {item.type === 'prescription' ? '💊' : item.type === 'lab_report' ? '🔬' : '🩺'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.date} • {item.doctor_name || 'Campus Health Center'}
                  </Text>
                </View>
                <Text style={styles.viewBadge}>View →</Text>
              </View>

              {item.summary && <Text style={styles.summaryText}>{item.summary}</Text>}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Record Inspector Modal */}
      <Modal visible={!!selectedRecord} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedRecord?.title}</Text>
                <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalMeta}>
                Issued by {selectedRecord?.doctor_name} on {selectedRecord?.date}
              </Text>

              {selectedRecord?.type === 'prescription' && selectedRecord.details && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailLabel}>Diagnosis:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.details.diagnosis}</Text>

                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Prescribed Medications:</Text>
                  {selectedRecord.details.medicines?.map((m: any, i: number) => (
                    <View key={i} style={styles.medRow}>
                      <Text style={styles.medName}>• {m.name}</Text>
                      <Text style={styles.medSub}>
                        Dosage: {m.dosage} | Freq: {m.frequency} ({m.duration})
                      </Text>
                    </View>
                  ))}

                  {selectedRecord.details.advice ? (
                    <>
                      <Text style={[styles.detailLabel, { marginTop: 10 }]}>Doctor Advice:</Text>
                      <Text style={styles.detailValue}>{selectedRecord.details.advice}</Text>
                    </>
                  ) : null}
                </View>
              )}

              {selectedRecord?.type === 'lab_report' && selectedRecord.details && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailLabel}>Lab Center: {selectedRecord.details.lab_name}</Text>
                  <View style={styles.labRow}>
                    <Text style={styles.labParam}>Hemoglobin (Hb):</Text>
                    <Text style={styles.labVal}>{selectedRecord.details.hb}</Text>
                  </View>
                  <View style={styles.labRow}>
                    <Text style={styles.labParam}>WBC Count:</Text>
                    <Text style={styles.labVal}>{selectedRecord.details.wbc}</Text>
                  </View>
                  <View style={styles.labRow}>
                    <Text style={styles.labParam}>Platelet Count:</Text>
                    <Text style={styles.labVal}>{selectedRecord.details.platelets}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setSelectedRecord(null)}
              >
                <Text style={styles.closeModalBtnText}>Close Record</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#2dd4bf',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  cardMeta: {
    color: '#2dd4bf',
    fontSize: 12,
    marginTop: 2,
  },
  viewBadge: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeBtnText: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: '800',
  },
  modalMeta: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  detailLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
  },
  medRow: {
    marginLeft: 8,
    marginTop: 4,
  },
  medName: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '700',
  },
  medSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  labRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  labParam: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  labVal: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '700',
  },
  closeModalBtn: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
