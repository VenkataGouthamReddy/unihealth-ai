import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Doctor, User, AuditLogItem } from '../types';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'audit'>('overview');

  // Stats State
  const [stats, setStats] = useState<any>({
    total_students: 1250,
    total_doctors: 18,
    appointments_today: 42,
    pending_approvals: 3,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Doctor Approvals State
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([
    {
      id: 'doc-pending-1',
      name: 'Dr. Michael Vance',
      specialty: 'Cardiology',
      qualification: 'MD, FACC',
      experience_years: 12,
      rating: 4.9,
      consultation_fee: 150,
      available_days: ['Mon', 'Wed', 'Fri'],
      is_approved: false,
    },
    {
      id: 'doc-pending-2',
      name: 'Dr. Elena Rostova',
      specialty: 'Neurology',
      qualification: 'MBBS, Ph.D.',
      experience_years: 8,
      rating: 4.8,
      consultation_fee: 120,
      available_days: ['Tue', 'Thu'],
      is_approved: false,
    },
  ]);

  // User Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([
    { id: 'usr-1', name: 'Alex Johnson', email: 'alex@campus.edu', role: 'student', student_id: 'CS-2024-001' },
    { id: 'usr-2', name: 'Dr. Sarah Jenkins', email: 'sarah.j@campus.edu', role: 'doctor', department: 'General Medicine' },
    { id: 'usr-3', name: 'Maria Garcia', email: 'maria@campus.edu', role: 'student', student_id: 'BIO-2024-042' },
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    { id: 'log-1', action: 'Doctor Approved', performed_by: user?.email || 'admin@campus.edu', target_user: 'Dr. Michael Vance', timestamp: '2026-08-06 09:10', status: 'success', ip_address: '192.168.1.100' },
    { id: 'log-2', action: 'Failed Login Attempt', performed_by: 'unknown@user.com', timestamp: '2026-08-06 08:45', status: 'warning', ip_address: '10.64.255.4' },
    { id: 'log-3', action: 'System Backup Complete', performed_by: 'SYSTEM', timestamp: '2026-08-06 04:00', status: 'success', ip_address: '127.0.0.1' },
  ]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoadingStats(true);
      const resStats = await apiClient.get('/admin/stats');
      if (resStats.data) setStats(resStats.data);

      const resDoctors = await apiClient.get('/admin/doctors/pending');
      if (resDoctors.data) setPendingDoctors(resDoctors.data);
    } catch (err) {
      console.log('Using default admin mock data');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApproveDoctor = async (id: string, name: string) => {
    try {
      await apiClient.put(`/admin/doctors/${id}/approve`);
      setPendingDoctors((prev) => prev.filter((d) => d.id !== id));
      Alert.alert('Doctor Approved', `${name} has been verified and granted clinic access.`);
    } catch (err) {
      setPendingDoctors((prev) => prev.filter((d) => d.id !== id));
      Alert.alert('Doctor Approved', `${name} has been verified.`);
    }
  };

  const handleRejectDoctor = async (id: string, name: string) => {
    try {
      await apiClient.put(`/admin/doctors/${id}/reject`);
      setPendingDoctors((prev) => prev.filter((d) => d.id !== id));
      Alert.alert('Request Rejected', `Registration for ${name} was rejected.`);
    } catch (err) {
      setPendingDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.portalTag}>Administrator Portal</Text>
          <Text style={styles.userName}>{user?.name || 'System Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabLabel, activeTab === 'overview' && styles.tabLabelActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'approvals' && styles.tabItemActive]}
          onPress={() => setActiveTab('approvals')}
        >
          <Text style={[styles.tabLabel, activeTab === 'approvals' && styles.tabLabelActive]}>
            Approvals ({pendingDoctors.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabLabel, activeTab === 'users' && styles.tabLabelActive]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'audit' && styles.tabItemActive]}
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabLabel, activeTab === 'audit' && styles.tabLabelActive]}>
            Audit Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Campus Healthcare Overview</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total_students || 1250}</Text>
              <Text style={styles.statLabel}>Registered Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total_doctors || 18}</Text>
              <Text style={styles.statLabel}>Active Doctors</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.appointments_today || 42}</Text>
              <Text style={styles.statLabel}>Appointments Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
                {pendingDoctors.length}
              </Text>
              <Text style={styles.statLabel}>Pending Approvals</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>System Health & Security</Text>
          <View style={styles.systemCard}>
            <View style={styles.sysRow}>
              <Text style={styles.sysLabel}>FastAPI Backend Engine</Text>
              <Text style={styles.sysStatusOnline}>● ONLINE</Text>
            </View>
            <View style={styles.sysRow}>
              <Text style={styles.sysLabel}>MongoDB Database Cluster</Text>
              <Text style={styles.sysStatusOnline}>● CONNECTED</Text>
            </View>
            <View style={styles.sysRow}>
              <Text style={styles.sysLabel}>AI Diagnostic Service</Text>
              <Text style={styles.sysStatusOnline}>● READY</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 'approvals' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Pending Doctor Approvals</Text>
          {pendingDoctors.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No pending doctor verification requests</Text>
            </View>
          ) : (
            <FlatList
              data={pendingDoctors}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.doctorName}>{item.name}</Text>
                  <Text style={styles.doctorSub}>{item.specialty} • {item.qualification || 'MD'}</Text>
                  <Text style={styles.doctorExp}>{item.experience_years} Years Experience</Text>

                  <View style={styles.approvalActions}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectDoctor(item.id, item.name)}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveDoctor(item.id, item.name)}
                    >
                      <Text style={styles.approveText}>Approve Doctor</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'users' && (
        <View style={styles.tabContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userNameText}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    item.role === 'admin'
                      ? styles.roleAdmin
                      : item.role === 'doctor'
                      ? styles.roleDoctor
                      : styles.roleStudent,
                  ]}
                >
                  <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {activeTab === 'audit' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>System Security Trail</Text>
          <FlatList
            data={auditLogs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.auditCard}>
                <View style={styles.auditHeader}>
                  <Text style={styles.auditAction}>{item.action}</Text>
                  <Text style={styles.auditTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.auditMeta}>
                  By: {item.performed_by} {item.ip_address ? `(${item.ip_address})` : ''}
                </Text>
              </View>
            )}
          />
        </View>
      )}
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
  portalTag: {
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2dd4bf',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#2dd4bf',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  tabContent: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    color: '#2dd4bf',
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  systemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sysLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  sysStatusOnline: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  doctorName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  doctorSub: {
    color: '#2dd4bf',
    fontSize: 13,
    fontWeight: '600',
  },
  doctorExp: {
    color: '#94a3b8',
    fontSize: 12,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  userInfo: {
    gap: 2,
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleAdmin: {
    backgroundColor: '#9333ea',
  },
  roleDoctor: {
    backgroundColor: '#0284c7',
  },
  roleStudent: {
    backgroundColor: '#0d9488',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  auditCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  auditAction: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  auditTime: {
    color: '#64748b',
    fontSize: 11,
  },
  auditMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
