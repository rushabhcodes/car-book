import AlertBanner from '@/components/ui/AlertBanner';
import QuickActionButton from '@/components/ui/QuickActionButton';
import StatCard from '@/components/ui/StatCard';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCarListingStore } from '@/store/carListingStore';
import { useDealerStore } from '@/store/dealerStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useRouter } from 'expo-router';
import { AlertCircle, Car, CreditCard, TrendingUp, UserPlus, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, pendingUsers, getPendingUsersCount } = useAuthStore();
  const { dealers } = useDealerStore();
  const { listings } = useCarListingStore();
  const { subscriptions } = useSubscriptionStore();
  
  const stats = {
    totalDealers: dealers.length,
    activeDealers: dealers.filter(dealer => dealer.status === 'active').length,
    pendingDealers: getPendingUsersCount(),
    totalListings: listings.length,
    pendingApprovals: listings.filter(listing => listing.status === 'pending').length,
    activeSubscriptions: subscriptions.filter(subscription => subscription.status === 'active').length,
    revenue: subscriptions.reduce((total, subscription) => {
      if (subscription.status === 'active') {
        const planAmounts = { basic: 999, premium: 1999, enterprise: 4999 };
        return total + (planAmounts[subscription.plan] || 0);
      }
      return total;
    }, 0),
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handlePendingUsers = () => {
    router.push('/(admin)/pending-users');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <AlertBanner
        count={stats.pendingDealers}
        message="pending dealer registration to review"
        actionText="Review"
        onPress={handlePendingUsers}
        icon={UserPlus}
        visible={stats.pendingDealers > 0}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            icon={Users}
            iconColor={colors.primary}
            iconBackgroundColor="rgba(59, 130, 246, 0.1)"
            value={stats.totalDealers}
            label="Total Dealers"
          />
          
          <StatCard
            icon={Users}
            iconColor={colors.success}
            iconBackgroundColor="rgba(16, 185, 129, 0.1)"
            value={stats.activeDealers}
            label="Active Dealers"
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard
            icon={Car}
            iconColor={colors.secondary}
            iconBackgroundColor="rgba(245, 158, 11, 0.1)"
            value={stats.totalListings}
            label="Total Listings"
          />
          
          <StatCard
            icon={AlertCircle}
            iconColor={colors.error}
            iconBackgroundColor="rgba(239, 68, 68, 0.1)"
            value={stats.pendingApprovals}
            label="Pending Approvals"
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard
            icon={CreditCard}
            iconColor="#8B5CF6"
            iconBackgroundColor="rgba(139, 92, 246, 0.1)"
            value={stats.activeSubscriptions}
            label="Active Subscriptions"
          />
          
          <StatCard
            icon={TrendingUp}
            iconColor={colors.success}
            iconBackgroundColor="rgba(16, 185, 129, 0.1)"
            value={`₹${stats.revenue.toLocaleString('en-IN')}`}
            label="Monthly Revenue"
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtonsContainer}>
          <QuickActionButton
            icon={Users}
            text="Manage Dealers"
            onPress={() => router.push('/(admin)/dealers')}
          />
          
          <QuickActionButton
            icon={Car}
            text="View All Listings"
            onPress={() => router.push('/(admin)/all-listings')}
          />
          
          <QuickActionButton
            icon={CreditCard}
            text="Manage Subscriptions"
            onPress={() => router.push('/(admin)/subscriptions')}
          />

          <QuickActionButton
            icon={UserPlus}
            text="Pending Registrations"
            onPress={() => router.push('/(admin)/pending-users')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: colors.error,
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    gap: 12,
  },
});