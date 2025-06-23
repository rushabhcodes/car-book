import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Users, Car, CreditCard, LayoutDashboard, UserPlus } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const router = useRouter();
  const { isAuthenticated, user, getPendingUsersCount } = useAuthStore();
  const pendingCount = getPendingUsersCount();

  // Protect admin routes
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Admin Dashboard",
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          tabBarLabel: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="dealers"
        options={{
          title: "Manage Dealers",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          tabBarLabel: "Dealers",
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
          tabBarLabel: "Subscriptions",
        }}
      />
      <Tabs.Screen
        name="all-listings"
        options={{
          title: "All Listings",
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
          tabBarLabel: "Listings",
        }}
      />
      <Tabs.Screen
        name="pending-users"
        options={{
          title: "Pending Users",
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
          tabBarLabel: "Pending",
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
    </Tabs>
  );
}