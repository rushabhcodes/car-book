import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useDealerStore } from '@/store/dealerStore';
import { User } from '@/types/auth';
import { Dealer } from '@/types/dealer';
import { AlertCircle, Check, RefreshCw, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PendingUsersScreen() {
  const { pendingUsers, approveUser, rejectUser, fetchPendingUsers, isLoading } = useAuthStore();
  const { addDealer } = useDealerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setError(null);
      await fetchPendingUsers();
    } catch (err) {
      setError('Failed to load pending users');
      console.error('Error loading pending users:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingUsers();
    setRefreshing(false);
  };

  const handleApprove = async (user: User) => {
    Alert.alert(
      "Approve Registration",
      `Are you sure you want to approve ${user.name}'s dealer registration?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Approve", 
          style: "default",
          onPress: async () => {
            try {
              // First approve the user in auth store
              await approveUser(user.id);
              
              // Then add the dealer to dealer store with default subscription
              const newDealer: Dealer = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: 'dealer',
                status: 'active',
                subscription: {
                  plan: 'basic',
                  status: 'active',
                  startDate: new Date().toISOString(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  amount: 999,
                  listingLimit: 10
                }
              };
              
              addDealer(newDealer);
              Alert.alert("Success", `${user.name} has been approved as a dealer`);
            } catch (error) {
              Alert.alert("Error", "Failed to approve dealer registration");
              console.error('Error approving user:', error);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (user: User) => {
    Alert.alert(
      "Reject Registration",
      `Are you sure you want to reject ${user.name}'s dealer registration?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject", 
          style: "destructive",
          onPress: async () => {
            try {
              await rejectUser(user.id);
              Alert.alert("Success", `${user.name}'s registration has been rejected`);
            } catch (error) {
              Alert.alert("Error", "Failed to reject dealer registration");
              console.error('Error rejecting user:', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: User }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>Dealer</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered:</Text>
            <Text style={styles.infoValue}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]} 
            onPress={() => handleApprove(item)}
          >
            <Check size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => handleReject(item)}
          >
            <X size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Pending Registrations</Text>
          <Text style={styles.subtitle}>
            {pendingUsers.length} pending approval{pendingUsers.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPendingUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading && pendingUsers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pending users...</Text>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No pending registrations</Text>
              <Text style={styles.emptySubtext}>All dealer registrations have been processed</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.error,
  },
  retryButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.error,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondary,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});