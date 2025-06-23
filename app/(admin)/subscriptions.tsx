import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useDealerStore } from '@/store/dealerStore';
import { Dealer, Subscription } from '@/types/dealer';
import colors from '@/constants/colors';
import { Edit, AlertCircle, X, Check } from 'lucide-react-native';

export default function SubscriptionsScreen() {
  const { dealers, updateDealer } = useDealerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState<Subscription>({
    plan: 'basic',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 999,
    listingLimit: 10
  });

  const handleEditSubscription = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    if (dealer.subscription) {
      setSubscriptionForm(dealer.subscription);
    } else {
      setSubscriptionForm({
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 999,
        listingLimit: 10
      });
    }
    setModalVisible(true);
  };

  const handleUpdateSubscription = () => {
    if (!selectedDealer) return;

    const updatedDealer = {
      ...selectedDealer,
      subscription: subscriptionForm
    };

    updateDealer(selectedDealer.id, updatedDealer);
    setModalVisible(false);
    Alert.alert("Success", "Subscription has been updated");
  };

  const renderItem = ({ item }: { item: Dealer }) => {
    const subscription = item.subscription;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dealerName}>{item.name}</Text>
            <Text style={styles.dealerEmail}>{item.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditSubscription(item)}
          >
            <Edit size={16} color="#FFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          {subscription ? (
            <>
              <View style={styles.subscriptionRow}>
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>Plan</Text>
                  <Text style={styles.itemValue}>
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                  </Text>
                </View>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    subscription.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      subscription.status === 'active' ? styles.activeText : styles.inactiveText
                    ]}>
                      {subscription.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.subscriptionRow}>
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>Amount</Text>
                  <Text style={styles.itemValue}>₹{subscription.amount.toLocaleString('en-IN')}</Text>
                </View>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>Listing Limit</Text>
                  <Text style={styles.itemValue}>{subscription.listingLimit}</Text>
                </View>
              </View>
              
              <View style={styles.subscriptionRow}>
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>Start Date</Text>
                  <Text style={styles.itemValue}>
                    {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.itemLabel}>End Date</Text>
                  <Text style={styles.itemValue}>
                    {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noSubscriptionContainer}>
              <Text style={styles.noSubscriptionText}>No active subscription</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleEditSubscription(item)}
              >
                <Text style={styles.addButtonText}>Add Subscription</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Subscriptions</Text>
      </View>
      
      <FlatList
        data={dealers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No dealers found</Text>
            <Text style={styles.emptySubtext}>Add dealers to manage their subscriptions</Text>
          </View>
        )}
      />
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Subscription</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.dealerInfoText}>
                Dealer: {selectedDealer?.name}
              </Text>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Subscription Plan</Text>
                
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setSubscriptionForm({
                      ...subscriptionForm,
                      plan: 'basic',
                      amount: 999
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      subscriptionForm.plan === 'basic' && styles.radioButtonSelected
                    ]}>
                      {subscriptionForm.plan === 'basic' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Basic (₹999/month)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setSubscriptionForm({
                      ...subscriptionForm,
                      plan: 'premium',
                      amount: 1999
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      subscriptionForm.plan === 'premium' && styles.radioButtonSelected
                    ]}>
                      {subscriptionForm.plan === 'premium' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Premium (₹1,999/month)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setSubscriptionForm({
                      ...subscriptionForm,
                      plan: 'enterprise',
                      amount: 4999
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      subscriptionForm.plan === 'enterprise' && styles.radioButtonSelected
                    ]}>
                      {subscriptionForm.plan === 'enterprise' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Enterprise (₹4,999/month)</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Status</Text>
                
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setSubscriptionForm({
                      ...subscriptionForm,
                      status: 'active'
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      subscriptionForm.status === 'active' && styles.radioButtonSelected
                    ]}>
                      {subscriptionForm.status === 'active' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Active</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setSubscriptionForm({
                      ...subscriptionForm,
                      status: 'inactive'
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      subscriptionForm.status === 'inactive' && styles.radioButtonSelected
                    ]}>
                      {subscriptionForm.status === 'inactive' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Inactive</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Listing Limit</Text>
                <TextInput
                  style={styles.input}
                  value={subscriptionForm.listingLimit.toString()}
                  onChangeText={(text) => {
                    const listingLimit = parseInt(text) || 10;
                    setSubscriptionForm({
                      ...subscriptionForm,
                      listingLimit
                    });
                  }}
                  keyboardType="numeric"
                  placeholder="Enter listing limit"
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Validity</Text>
                
                <View style={styles.dateContainer}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>
                      {new Date(subscriptionForm.startDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateValue}>
                      {new Date(subscriptionForm.endDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.extendButton}
                  onPress={() => {
                    const currentEndDate = new Date(subscriptionForm.endDate);
                    currentEndDate.setMonth(currentEndDate.getMonth() + 1);
                    setSubscriptionForm({
                      ...subscriptionForm,
                      endDate: currentEndDate.toISOString()
                    });
                  }}
                >
                  <Text style={styles.extendButtonText}>Extend by 1 Month</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateSubscription}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.saveButtonText}>Update Subscription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
  dealerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  dealerEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  subscriptionItem: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
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
  noSubscriptionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  noSubscriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '500',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  dealerInfoText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  radioContainer: {
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  extendButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  extendButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: colors.inputBackground,
    marginRight: 12,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
});