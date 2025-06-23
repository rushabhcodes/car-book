import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { Tabs, useRouter } from "expo-router";
import { Car, List, User } from "lucide-react-native";
import { useEffect } from "react";

export default function TabLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userStatus = useAuthStore((state) => state.user?.status);
  const userRole = useAuthStore((state) => state.user?.role);

  // Protect dealer routes
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (userRole === "admin") {
      router.replace("/(admin)/dashboard");
    }
  }, [isAuthenticated, userRole, userStatus, router]);

  return (
    <Tabs
      key={userStatus}
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
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="list_car"
        options={{
          href: userStatus === "pending" ? null : undefined,
          title: "List your vehicle",
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
          tabBarLabel: "List Vehicle",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Listing",
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
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
