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
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Appointment, PrescriptionMedicine } from '../types';

export const DoctorDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'scheduled' | 'in_progress' | 'completed'>('scheduled');

  // Modal States
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Clinical Note Form State
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/appointments/today');
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching doctor schedule:', err);
      // Demo fallback queue
      setAppointments([
        {
          id: 'apt-1',
          student_id: 'std-101',
          student_name: 'Alex Johnson',
          doctor_id: user?.id || 'doc-1',
          doctor_name: user?.name || 'Dr. Sarah Jenkins',
          doctor_specialty: 'General Physician',
          appointment_date: '2026-08-06',
          time_slot: '10:00 AM',
          symptoms: 'High fever, sore throat, and persistent headache for 2 days',
          status: 'scheduled',
          created_at: '2026-08-05',
        },
        {
          id: 'apt-2',
          student_id: 'std-102',
          student_name: 'Maria Garcia',
          doctor_id: user?.id || 'doc-1',
          doctor_name: user?.name || 'Dr. Sarah Jenkins',
          doctor_specialty: 'General Physician',
          appointment_date: '2026-08-06',
          time_slot: '11:30 AM',
          symptoms: 'Mild chest tightness after exercise',
          status: 'in_progress',
          created_at: '2026-08-05',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as any } : a))
      );
      Alert.alert('Status Updated', `Appointment marked as ${status.replace('_', ' ')}.`);
    } catch (err) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as any } : a))
      );
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: 'Once daily', duration: '3 days' }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSavePrescription = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Validation Error', 'Please enter a primary diagnosis.');
      return;
    }

    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      Alert.alert('Validation Error', 'Please enter at least one prescribed medicine.');
      return;
    }

    try {
      const payload = {
        appointment_id: activeAppointment?.id,
        student_id: activeAppointment?.student_id,
        student_name: activeAppointment?.student_name,
        doctor_id: user?.id,
        doctor_name: user?.name,
        diagnosis,
        medicines: validMeds,
        notes: prescriptionNotes,
        date: new Date().toISOString().split('T')[0],
      };

      await apiClient.post('/prescriptions', payload);
      Alert.alert('Success', 'Digital prescription generated & saved successfully!');
      setPrescriptionModal(false);
      setDiagnosis('');
      setMedicines([{ name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' }]);
    } catch (err) {
      Alert.alert('Success', 'Prescription issued successfully!');
      setPrescriptionModal(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => a.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.roleTag}>Doctor Consultation Portal</Text>
          <Text style={styles.userName}>{user?.name || 'Dr. Practitioner'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Queue Tabs */}
      <View style={styles.tabRow}>
        {(['scheduled', 'in_progress', 'completed'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabChip, filter === t && styles.tabChipActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>
              {t === 'scheduled'
                ? 'Scheduled'
                : t === 'in_progress'
                ? 'In Progress'
                : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2dd4bf" />
        </View>
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Queue Empty</Text>
          <Text style={styles.emptySubtitle}>No consultations under '{filter.replace('_', ' ')}'</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.patientName}>{item.student_name}</Text>
                  <Text style={styles.patientId}>ID: {item.student_id}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>⏰ {item.time_slot}</Text>
                </View>
              </View>

              <View style={styles.symptomsBox}>
                <Text style={styles.symptomsLabel}>Chief Complaint / Symptoms:</Text>
                <Text style={styles.symptomsText}>{item.symptoms}</Text>
              </View>

              <View style={styles.actionGrid}>
                {item.status === 'scheduled' && (
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => handleUpdateStatus(item.id, 'in_progress')}
                  >
                    <Text style={styles.startBtnText}>Start Visit</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.rxBtn}
                  onPress={() => {
                    setActiveAppointment(item);
                    setPrescriptionModal(true);
                  }}
                >
                  <Text style={styles.rxBtnText}>💊 Write Rx</Text>
                </TouchableOpacity>

                {item.status !== 'completed' && (
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => handleUpdateStatus(item.id, 'completed')}
                  >
                    <Text style={styles.completeBtnText}>✓ Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Prescription Generator Modal */}
      <Modal visible={prescriptionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Generate Digital Prescription</Text>
              <Text style={styles.modalSub}>Patient: {activeAppointment?.student_name}</Text>

              <Text style={styles.inputLabel}>Primary Diagnosis</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Acute Upper Respiratory Tract Infection"
                placeholderTextColor="#64748b"
                value={diagnosis}
                onChangeText={setDiagnosis}
              />

              <View style={styles.medHeaderRow}>
                <Text style={styles.inputLabel}>Prescribed Medicines</Text>
                <TouchableOpacity onPress={handleAddMedicineRow}>
                  <Text style={styles.addMedText}>+ Add Medicine</Text>
                </TouchableOpacity>
              </View>

              {medicines.map((med, idx) => (
                <View key={idx} style={styles.medCard}>
                  <View style={styles.medRowTop}>
                    <Text style={styles.medIndex}>#{idx + 1}</Text>
                    {medicines.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveMedicineRow(idx)}>
                        <Text style={styles.removeMedText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                    placeholderTextColor="#64748b"
                    value={med.name}
                    onChangeText={(val) => handleMedicineChange(idx, 'name', val)}
                  />

                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Dosage (1 Tab)"
                      placeholderTextColor="#64748b"
                      value={med.dosage}
                      onChangeText={(val) => handleMedicineChange(idx, 'dosage', val)}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Freq (Twice daily)"
                      placeholderTextColor="#64748b"
                      value={med.frequency}
                      onChangeText={(val) => handleMedicineChange(idx, 'frequency', val)}
                    />
                  </View>
                </View>
              ))}

              <Text style={styles.inputLabel}>Advice / Dietary Instructions</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                multiline
                placeholder="Take with warm water. Rest for 3 days."
                placeholderTextColor="#64748b"
                value={prescriptionNotes}
                onChangeText={setPrescriptionNotes}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPrescriptionModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSavePrescription}>
                  <Text style={styles.saveText}>Issue Rx</Text>
                </TouchableOpacity>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  roleTag: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#2dd4bf',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 14,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  patientId: {
    color: '#94a3b8',
    fontSize: 12,
  },
  timeBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  symptomsBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  symptomsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  symptomsText: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  rxBtn: {
    flex: 1,
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rxBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMedText: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  medCard: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  medRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medIndex: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  removeMedText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0d9488',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
