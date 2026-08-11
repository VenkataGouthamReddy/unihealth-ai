import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiClient from '../api/client';

export const BookAppointmentScreen = ({ route, navigation }: any) => {
  const { doctorId, doctor } = route.params || {};

  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleBooking = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Required', 'Please describe your symptoms or reason for visit');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/appointments/book', {
        doctor_id: doctorId || 'doc_1',
        doctor_name: doctor?.name || 'Dr. Health Specialist',
        doctor_specialty: doctor?.specialty || 'General Medicine',
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms: symptoms.trim(),
      });
      Alert.alert('Success 🎉', 'Appointment booked successfully!', [
        { text: 'View Appointments', onPress: () => navigation.navigate('Appointments') },
      ]);
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      Alert.alert('Booking Error', err.response?.data?.detail || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Book Appointment</Text>

        {doctor && (
          <View style={styles.doctorHeader}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docSpec}>{doctor.specialty}</Text>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TextInput
            style={styles.input}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
          />
        </View>

        {/* Time Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.slotGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms / Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms / Reason for Visit</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Describe symptoms, medical history, or specific concerns..."
            placeholderTextColor="#64748b"
            value={symptoms}
            onChangeText={setSymptoms}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleBooking}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 8,
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
  doctorHeader: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0d9488',
  },
  docName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  docSpec: {
    color: '#2dd4bf',
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    width: '31%',
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  slotChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#2dd4bf',
  },
  slotText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
