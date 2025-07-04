import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useRouter } from 'expo-router';
import { Bell, CreditCard, Edit, HelpCircle, LogOut, Shield } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuthStore();
  const { 
    currentUserSubscription, 
    fetchUserSubscription, 
    isLoading,
    isSubscriptionActive,
    isSubscriptionExpired,
    getRemainingDays 
  } = useSubscriptionStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    if (user?.id) {
      await fetchUserSubscription(user.id);
    }
    setRefreshing(false);
  }, [user?.id]);

  // Fetch user subscription when component mounts or user changes
  React.useEffect(() => {
    if (user?.id) {
      fetchUserSubscription(user.id);
    }
  }, [user?.id]);
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const getSubscriptionDetails = () => {
    if (!currentUserSubscription) {
      return {
        plan: 'No active subscription',
        status: 'inactive',
        validUntil: 'N/A',
        isActive: false,
        isExpired: false,
        remainingDays: 0,
      };
    }
    
    const isActive = isSubscriptionActive(currentUserSubscription);
    const isExpired = isSubscriptionExpired(currentUserSubscription);
    const remainingDays = getRemainingDays(currentUserSubscription);
    
    return {
      plan: currentUserSubscription.plan.charAt(0).toUpperCase() + currentUserSubscription.plan.slice(1),
      status: currentUserSubscription.status,
      validUntil: new Date(currentUserSubscription.end_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      isActive,
      isExpired,
      remainingDays,
    };
  };

  const subscriptionDetails = getSubscriptionDetails();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} 
    refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.profilePhone}>{user?.phone || 'No phone number'}</Text>
        </View>
      </View>
      
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionTitle}>Current Subscription</Text>
          <CreditCard size={20} color={colors.primary} />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading subscription...</Text>
          </View>
        ) : (
          <View style={styles.subscriptionDetails}>
            <Text style={styles.planName}>{subscriptionDetails.plan}</Text>
            
            <View style={styles.subscriptionInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  subscriptionDetails.isActive ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    subscriptionDetails.isActive ? styles.activeText : styles.inactiveText
                  ]}>
                    {subscriptionDetails.isActive ? 'Active' : 
                     subscriptionDetails.isExpired ? 'Expired' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Valid Until</Text>
                <Text style={[
                  styles.infoValue,
                  subscriptionDetails.isExpired && styles.expiredText
                ]}>
                  {subscriptionDetails.validUntil}
                </Text>
              </View>

              {currentUserSubscription && (
                <>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Listing Limit</Text>
                    <Text style={styles.infoValue}>{currentUserSubscription.listing_limit}</Text>
                  </View>
                  
                  {subscriptionDetails.isActive && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Days Remaining</Text>
                      <Text style={[
                        styles.infoValue,
                        subscriptionDetails.remainingDays <= 7 && styles.warningText
                      ]}>
                        {subscriptionDetails.remainingDays} days
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>Account Settings</Text>
      </View>
      
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Edit size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Bell size={20} color={colors.secondary} />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Shield size={20} color={colors.success} />
            </View>
            <Text style={styles.menuItemText}>Privacy & Security</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <HelpCircle size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>CarBook v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 CarBook. All rights reserved.</Text>
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
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subscriptionDetails: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    minWidth: '48%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.error,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expiredText: {
    color: colors.error,
  },
  warningText: {
    color: '#f59e0b',
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItemArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: colors.error,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});