import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Appointment } from '../types';

export const StudentHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await apiClient.get('/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2dd4bf" />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Reminders')}
            >
              <Text style={styles.iconBtnText}>💊</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Assistant Callout Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.9}
        >
          <View style={styles.aiBannerBadge}>
            <Text style={styles.aiBannerBadgeText}>AI HEALTH CONSULTANT</Text>
          </View>
          <Text style={styles.aiBannerTitle}>Ask UniHealth AI Anything</Text>
          <Text style={styles.aiBannerSubtitle}>
            Instant medical advice, symptom analysis, and campus healthcare guidance.
          </Text>
          <View style={styles.aiBannerBtn}>
            <Text style={styles.aiBannerBtnText}>Start AI Chat →</Text>
          </View>
        </TouchableOpacity>

        {/* Active Reminders Quick Widget */}
        <TouchableOpacity
          style={styles.reminderWidget}
          onPress={() => navigation.navigate('Reminders')}
        >
          <View style={styles.reminderLeft}>
            <Text style={styles.reminderIcon}>💊</Text>
            <View>
              <Text style={styles.reminderTitle}>Daily Dose Due at 08:00 AM</Text>
              <Text style={styles.reminderSub}>Amoxicillin 500mg • 1 Capsule after meals</Text>
            </View>
          </View>
          <Text style={styles.reminderArrow}>→</Text>
        </TouchableOpacity>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Healthcare Services</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Doctors')}
          >
            <Text style={styles.gridIcon}>👨‍⚕️</Text>
            <Text style={styles.gridTitle}>Find Doctor</Text>
            <Text style={styles.gridSub}>Book appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('SymptomChecker')}
          >
            <Text style={styles.gridIcon}>🩺</Text>
            <Text style={styles.gridTitle}>Symptom Check</Text>
            <Text style={styles.gridSub}>AI triage evaluation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={styles.gridIcon}>📅</Text>
            <Text style={styles.gridTitle}>Appointments</Text>
            <Text style={styles.gridSub}>View scheduled</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('HealthRecords')}
          >
            <Text style={styles.gridIcon}>📁</Text>
            <Text style={styles.gridTitle}>Health Records</Text>
            <Text style={styles.gridSub}>Prescriptions & lab</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Reminders')}
          >
            <Text style={styles.gridIcon}>⏰</Text>
            <Text style={styles.gridTitle}>Reminders</Text>
            <Text style={styles.gridSub}>Pills & checkups</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.gridIcon}>🔔</Text>
            <Text style={styles.gridTitle}>Notifications</Text>
            <Text style={styles.gridSub}>Alerts & updates</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No appointments scheduled yet</Text>
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('Doctors')}
            >
              <Text style={styles.bookNowBtnText}>Book Appointment Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.slice(0, 2).map((apt) => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptHeader}>
                <Text style={styles.aptDoctor}>{apt.doctor_name}</Text>
                <View style={styles.statusChip}>
                  <Text style={styles.statusText}>{apt.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.aptSpecialty}>{apt.doctor_specialty}</Text>
              <Text style={styles.aptTime}>
                🕒 {apt.appointment_date} at {apt.time_slot}
              </Text>
            </View>
          ))
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconBtnText: {
    fontSize: 18,
  },
  aiBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0d9488',
    gap: 8,
  },
  aiBannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0d9488',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiBannerBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  aiBannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  aiBannerSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  aiBannerBtn: {
    marginTop: 4,
  },
  aiBannerBtnText: {
    color: '#2dd4bf',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderWidget: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2dd4bf',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderIcon: {
    fontSize: 22,
  },
  reminderTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  reminderArrow: {
    color: '#2dd4bf',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridIcon: {
    fontSize: 24,
  },
  gridTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  gridSub: {
    color: '#64748b',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  bookNowBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookNowBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aptCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aptDoctor: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statusChip: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '800',
  },
  aptSpecialty: {
    color: '#94a3b8',
    fontSize: 13,
  },
  aptTime: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
  },
});
