import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo or standard vector icons

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';

import { StudentHomeScreen } from '../screens/StudentHomeScreen';
import { DoctorsScreen } from '../screens/DoctorsScreen';
import { BookAppointmentScreen } from '../screens/BookAppointmentScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { SymptomCheckerScreen } from '../screens/SymptomCheckerScreen';
import { HealthRecordsScreen } from '../screens/HealthRecordsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RemindersScreen } from '../screens/RemindersScreen';

import { DoctorDashboardScreen } from '../screens/DoctorDashboardScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Common Tab Bar Options for all roles
const commonTabOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#0f172a',
    borderTopColor: '#334155',
    height: 60,
    paddingBottom: 8,
  },
  tabBarActiveTintColor: '#2dd4bf',
  tabBarInactiveTintColor: '#64748b',
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '700',
  },
};

function StudentTabNavigator() {
  return (
    <Tab.Navigator screenOptions={commonTabOptions}>
      <Tab.Screen name="Home" component={StudentHomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Doctors" component={DoctorsScreen} options={{ tabBarLabel: 'Doctors' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: 'Appointments' }} />
      <Tab.Screen name="AIChat" component={AIChatScreen} options={{ tabBarLabel: 'AI Health' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function DoctorTabNavigator() {
  return (
    <Tab.Navigator screenOptions={commonTabOptions}>
      <Tab.Screen name="Home" component={DoctorDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      {/* We reuse the Profile screen for doctors too */}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={commonTabOptions}>
      <Tab.Screen name="Home" component={AdminDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      {/* We reuse the Profile screen for admins too */}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'System' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        </>
      ) : user.role === 'doctor' ? (
        <>
          <Stack.Screen name="DoctorMain" component={DoctorTabNavigator} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : user.role === 'admin' ? (
        <>
          <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentMain" component={StudentTabNavigator} />
          <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
          <Stack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
          <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Reminders" component={RemindersScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
