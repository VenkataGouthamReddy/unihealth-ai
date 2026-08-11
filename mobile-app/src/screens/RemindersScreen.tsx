import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { ReminderItem } from '../types';

export const RemindersScreen = ({ navigation }: any) => {
  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: '1',
      title: 'Amoxicillin 500mg',
      dosage: '1 Capsule after meals',
      time: '08:00 AM',
      frequency: 'Twice daily',
      type: 'medicine',
      enabled: true,
    },
    {
      id: '2',
      title: 'Hydration Track',
      dosage: '500ml Water Intake',
      time: '11:00 AM',
      frequency: 'Every 3 hours',
      type: 'water',
      enabled: true,
    },
    {
      id: '3',
      title: 'Vitals & BP Log',
      dosage: 'Record Systolic/Diastolic',
      time: '06:00 PM',
      frequency: 'Daily',
      type: 'vitals',
      enabled: false,
    },
    {
      id: '4',
      title: 'Dental Checkup Follow-up',
      dosage: 'Campus Health Clinic',
      time: '10:00 AM',
      frequency: 'Monthly',
      type: 'checkup',
      enabled: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newFrequency, setNewFrequency] = useState('Daily');
  const [newType, setNewType] = useState<'medicine' | 'checkup' | 'vitals' | 'water'>('medicine');

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const deleteReminder = (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to remove this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setReminders((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
  };

  const handleAddReminder = () => {
    if (!newTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the reminder.');
      return;
    }

    const newItem: ReminderItem = {
      id: Date.now().toString(),
      title: newTitle,
      dosage: newDosage || 'As prescribed',
      time: newTime,
      frequency: newFrequency,
      type: newType,
      enabled: true,
    };

    setReminders([newItem, ...reminders]);
    setModalVisible(false);
    setNewTitle('');
    setNewDosage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Medication Reminders</Text>
          <Text style={styles.headerSubtitle}>Keep track of daily doses & wellness tasks</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.enabled && styles.cardDisabled]}>
            <View style={styles.cardMain}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                  {item.type === 'medicine'
                    ? '💊'
                    : item.type === 'water'
                    ? '💧'
                    : item.type === 'vitals'
                    ? '🩺'
                    : '📅'}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, !item.enabled && styles.textDisabled]}>
                  {item.title}
                </Text>
                {item.dosage ? <Text style={styles.dosage}>{item.dosage}</Text> : null}
                <View style={styles.metaRow}>
                  <Text style={styles.timeTag}>⏰ {item.time}</Text>
                  <Text style={styles.freqTag}>• {item.frequency}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleReminder(item.id)}
                trackColor={{ false: '#334155', true: '#0d9488' }}
                thumbColor={item.enabled ? '#2dd4bf' : '#94a3b8'}
              />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReminder(item.id)}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add Reminder Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Health Reminder</Text>

            <Text style={styles.inputLabel}>Reminder Name / Medicine</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Paracetamol 500mg"
              placeholderTextColor="#64748b"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Instructions / Dosage</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1 Tablet after breakfast"
              placeholderTextColor="#64748b"
              value={newDosage}
              onChangeText={setNewDosage}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Scheduled Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00 AM"
                  placeholderTextColor="#64748b"
                  value={newTime}
                  onChangeText={setNewTime}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Frequency</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Daily"
                  placeholderTextColor="#64748b"
                  value={newFrequency}
                  onChangeText={setNewFrequency}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddReminder}>
                <Text style={styles.saveText}>Save Reminder</Text>
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
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  textDisabled: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  dosage: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  timeTag: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '600',
  },
  freqTag: {
    color: '#64748b',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0d9488',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
