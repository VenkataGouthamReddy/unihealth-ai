import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { EmergencyContact, UserVitals } from '../types';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  // Vitals State
  const [vitals, setVitals] = useState<UserVitals>(
    user?.vitals || {
      blood_pressure: '120/80',
      pulse: 72,
      temperature: 98.6,
      weight: 68,
      recorded_at: '2026-08-05',
    }
  );

  // Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(
    user?.emergency_contact || {
      name: 'Robert Johnson (Father)',
      relationship: 'Parent / Guardian',
      phone: '+1 (555) 234-5678',
    }
  );

  // Medical Tags State
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || ['Penicillin', 'Peanuts']);
  const [newAllergy, setNewAllergy] = useState('');

  // Modals
  const [vitalsModal, setVitalsModal] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState(false);

  // Vitals Inputs
  const [bpInput, setBpInput] = useState(vitals.blood_pressure || '');
  const [pulseInput, setPulseInput] = useState(vitals.pulse ? vitals.pulse.toString() : '');
  const [tempInput, setTempInput] = useState(vitals.temperature ? vitals.temperature.toString() : '');
  const [weightInput, setWeightInput] = useState(vitals.weight ? vitals.weight.toString() : '');

  // Emergency Contact Inputs
  const [eName, setEName] = useState(emergencyContact.name);
  const [eRel, setERel] = useState(emergencyContact.relationship);
  const [ePhone, setEPhone] = useState(emergencyContact.phone);

  const handleSaveVitals = () => {
    setVitals({
      blood_pressure: bpInput || '120/80',
      pulse: pulseInput ? parseInt(pulseInput) : 72,
      temperature: tempInput ? parseFloat(tempInput) : 98.6,
      weight: weightInput ? parseFloat(weightInput) : 68,
      recorded_at: new Date().toISOString().split('T')[0],
    });
    setVitalsModal(false);
    Alert.alert('Vitals Updated', 'Your health vitals have been logged successfully.');
  };

  const handleSaveEmergencyContact = () => {
    setEmergencyContact({
      name: eName,
      relationship: eRel,
      phone: ePhone,
    });
    setEmergencyModal(false);
    Alert.alert('Contact Saved', 'Emergency contact information updated.');
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.userName}>{user?.name || 'Student Patient'}</Text>
            <Text style={styles.userRole}>
              {user?.role?.toUpperCase() || 'STUDENT'} • ID: {user?.student_id || 'STD-8842'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'student@campus.edu'}</Text>
          </View>
        </View>

        {/* Health Vitals Log Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🩺 Health Vitals Log</Text>
            <TouchableOpacity onPress={() => setVitalsModal(true)}>
              <Text style={styles.editLink}>Update Vitals</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalValue}>{vitals.blood_pressure}</Text>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalValue}>{vitals.pulse} bpm</Text>
              <Text style={styles.vitalLabel}>Heart Pulse</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalValue}>{vitals.temperature}°F</Text>
              <Text style={styles.vitalLabel}>Body Temp</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalValue}>{vitals.weight} kg</Text>
              <Text style={styles.vitalLabel}>Weight</Text>
            </View>
          </View>
          <Text style={styles.lastLogged}>Last recorded: {vitals.recorded_at}</Text>
        </View>

        {/* Emergency Contact Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🚨 Emergency Contact</Text>
            <TouchableOpacity onPress={() => setEmergencyModal(true)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactContent}>
            <Text style={styles.contactName}>{emergencyContact.name}</Text>
            <Text style={styles.contactRel}>{emergencyContact.relationship}</Text>
            <Text style={styles.contactPhone}>📞 {emergencyContact.phone}</Text>
          </View>
        </View>

        {/* Known Allergies & Medical Tagging */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Known Medical Allergies</Text>

          <View style={styles.tagWrap}>
            {allergies.map((allergy, idx) => (
              <View key={idx} style={styles.allergyTag}>
                <Text style={styles.allergyText}>{allergy}</Text>
                <TouchableOpacity onPress={() => handleRemoveAllergy(idx)}>
                  <Text style={styles.removeTag}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addTagRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add allergy (e.g. Latex)..."
              placeholderTextColor="#64748b"
              value={newAllergy}
              onChangeText={setNewAllergy}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddAllergy}>
              <Text style={styles.addTagText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign Out of Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Vitals Modal */}
      <Modal visible={vitalsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Health Vitals</Text>

            <Text style={styles.inputLabel}>Blood Pressure (mmHg)</Text>
            <TextInput
              style={styles.input}
              placeholder="120/80"
              placeholderTextColor="#64748b"
              value={bpInput}
              onChangeText={setBpInput}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Pulse (bpm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="72"
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                  value={pulseInput}
                  onChangeText={setPulseInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Temp (°F)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="98.6"
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                  value={tempInput}
                  onChangeText={setTempInput}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Body Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="68"
              keyboardType="numeric"
              placeholderTextColor="#64748b"
              value={weightInput}
              onChangeText={setWeightInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVitalsModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveVitals}>
                <Text style={styles.saveText}>Save Vitals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Emergency Contact Modal */}
      <Modal visible={emergencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contact Details</Text>

            <Text style={styles.inputLabel}>Contact Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Robert Johnson"
              placeholderTextColor="#64748b"
              value={eName}
              onChangeText={setEName}
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Parent / Guardian"
              placeholderTextColor="#64748b"
              value={eRel}
              onChangeText={setERel}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              placeholderTextColor="#64748b"
              value={ePhone}
              onChangeText={setEPhone}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEmergencyModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEmergencyContact}>
                <Text style={styles.saveText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scroll: {
    padding: 20,
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  userRole: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
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
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  editLink: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '700',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  vitalValue: {
    color: '#2dd4bf',
    fontSize: 18,
    fontWeight: '800',
  },
  vitalLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  lastLogged: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
  },
  contactContent: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  contactName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  contactRel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  contactPhone: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#991b1b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allergyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  removeTag: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '800',
  },
  addTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addTagBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
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
