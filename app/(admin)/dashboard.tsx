import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, Users, CreditCard, TrendingUp, AlertCircle, UserPlus } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useDealerStore } from '@/store/dealerStore';
import { useCarListingStore } from '@/store/carListingStore';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, pendingUsers, getPendingUsersCount } = useAuthStore();
  const { dealers } = useDealerStore();
  const { listings } = useCarListingStore();
  
  const stats = {
    totalDealers: dealers.length,
    activeDealers: dealers.filter(dealer => dealer.status === 'active').length,
    pendingDealers: getPendingUsersCount(),
    totalListings: listings.length,
    pendingApprovals: listings.filter(listing => listing.status === 'pending').length,
    activeSubscriptions: dealers.filter(dealer => dealer.subscription?.status === 'active').length,
    revenue: dealers.reduce((total, dealer) => {
      if (dealer.subscription?.status === 'active') {
        return total + (dealer.subscription?.amount || 0);
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

      {stats.pendingDealers > 0 && (
        <TouchableOpacity 
          style={styles.pendingUsersAlert}
          onPress={handlePendingUsers}
        >
          <UserPlus size={20} color={colors.secondary} />
          <Text style={styles.pendingUsersText}>
            {stats.pendingDealers} pending dealer registration{stats.pendingDealers > 1 ? 's' : ''} to review
          </Text>
          <Text style={styles.pendingUsersAction}>Review</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Users size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalDealers}</Text>
            <Text style={styles.statLabel}>Total Dealers</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Users size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.activeDealers}</Text>
            <Text style={styles.statLabel}>Active Dealers</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Car size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.totalListings}</Text>
            <Text style={styles.statLabel}>Total Listings</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <AlertCircle size={24} color={colors.error} />
            </View>
            <Text style={styles.statValue}>{stats.pendingApprovals}</Text>
            <Text style={styles.statLabel}>Pending Approvals</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <CreditCard size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.activeSubscriptions}</Text>
            <Text style={styles.statLabel}>Active Subscriptions</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <TrendingUp size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>₹{stats.revenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/dealers')}
          >
            <Users size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Manage Dealers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/all-listings')}
          >
            <Car size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>View All Listings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/subscriptions')}
          >
            <CreditCard size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Manage Subscriptions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/pending-users')}
          >
            <UserPlus size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Pending Registrations</Text>
          </TouchableOpacity>
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
  pendingUsersAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  pendingUsersText: {
    flex: 1,
    color: colors.text,
    marginLeft: 8,
  },
  pendingUsersAction: {
    color: colors.secondary,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
});