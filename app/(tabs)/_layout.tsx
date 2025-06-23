import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { useRouter } from 'expo-router';
import { Car, List, User } from "lucide-react-native";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Protect dealer routes
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    if (user?.role === 'admin') {
      router.replace('/(admin)/dashboard');
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
        name="index"
        options={{
          title: "List Your Car",
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
          tabBarLabel: "List Car",
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: "My Listings",
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
          tabBarLabel: "Listings",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}