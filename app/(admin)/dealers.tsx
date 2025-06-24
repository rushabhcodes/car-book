import colors from '@/constants/colors';
import { useDealerStore } from '@/store/dealerStore';
import { Dealer, Subscription } from '@/types/dealer';
import { AlertCircle, Check, Edit, Plus, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function DealersScreen() {
  const { dealers, addDealer, updateDealer, deleteDealer } = useDealerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDealer, setCurrentDealer] = useState<Dealer | null>(null);
  
  const [formData, setFormData] = useState<Omit<Dealer, 'id'> & {id?: string}>({
    name: '',
    email: '',
    phone: '',
    role: 'dealer',
    status: 'active',
    companyName: '',
    address: '',
    subscription: {
      plan: 'basic',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 999,
      listingLimit: 10
    }
  });

  const handleAddDealer = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'dealer',
      status: 'active',
      companyName: '',
      address: '',
      subscription: {
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 999,
        listingLimit: 10
      }
    });
    setModalVisible(true);
  };

  const handleEditDealer = (dealer: Dealer) => {
    setIsEditing(true);
    setCurrentDealer(dealer);
    setFormData({
      ...dealer,
      subscription: dealer.subscription || {
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 999,
        listingLimit: 10
      }
    });
    setModalVisible(true);
  };

  const handleDeleteDealer = (id: string) => {
    Alert.alert(
      "Delete Dealer",
      "Are you sure you want to delete this dealer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteDealer(id);
            Alert.alert("Success", "Dealer has been deleted");
          }
        }
      ]
    );
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    if (isEditing && currentDealer) {
      updateDealer(currentDealer.id, formData as Dealer);
      Alert.alert("Success", "Dealer information has been updated");
    } else {
      addDealer({
        ...formData,
        id: Date.now().toString(),
      } as Dealer);
      Alert.alert("Success", "New dealer has been added");
    }
    
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Dealer }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dealerName}>{item.name}</Text>
            <Text style={styles.dealerCompany}>{item.companyName || 'No company name'}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            item.status === 'active' ? styles.activeBadge : 
            item.status === 'pending' ? styles.pendingBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'active' ? styles.activeText : 
              item.status === 'pending' ? styles.pendingText : styles.inactiveText
            ]}>
              {item.status === 'active' ? 'Active' : 
               item.status === 'pending' ? 'Pending' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{item.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{item.address || 'Not provided'}</Text>
          </View>
          
          <View style={styles.subscriptionContainer}>
            <Text style={styles.subscriptionTitle}>Subscription</Text>
            <View style={styles.subscriptionDetails}>
              <View style={styles.subscriptionItem}>
                <Text style={styles.subscriptionLabel}>Plan:</Text>
                <Text style={styles.subscriptionValue}>
                  {item.subscription?.plan ? item.subscription.plan.charAt(0).toUpperCase() + item.subscription.plan.slice(1) : 'None'}
                </Text>
              </View>
              <View style={styles.subscriptionItem}>
                <Text style={styles.subscriptionLabel}>Status:</Text>
                <View style={[
                  styles.miniStatusBadge, 
                  item.subscription?.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  <Text style={[
                    styles.miniStatusText,
                    item.subscription?.status === 'active' ? styles.activeText : styles.inactiveText
                  ]}>
                    {item.subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.subscriptionItem}>
                <Text style={styles.subscriptionLabel}>Amount:</Text>
                <Text style={styles.subscriptionValue}>
                  ₹{item.subscription?.amount?.toLocaleString('en-IN') || '0'}
                </Text>
              </View>
              <View style={styles.subscriptionItem}>
                <Text style={styles.subscriptionLabel}>Listing Limit:</Text>
                <Text style={styles.subscriptionValue}>
                  {item.subscription?.listingLimit || 10}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEditDealer(item)}
          >
            <Edit size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDeleteDealer(item.id)}
          >
            <Trash2 size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Dealers</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddDealer}
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Dealer</Text>
        </TouchableOpacity>
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
            <Text style={styles.emptySubtext}>Add your first dealer to get started</Text>
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
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Dealer' : 'Add New Dealer'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter dealer's full name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="Enter 10-digit phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.companyName}
                  onChangeText={(text) => setFormData({...formData, companyName: text})}
                  placeholder="Enter company name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  placeholder="Enter full address"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({...formData, status: 'active'})}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.status === 'active' && styles.radioButtonSelected
                    ]}>
                      {formData.status === 'active' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Active</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({...formData, status: 'inactive'})}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.status === 'inactive' && styles.radioButtonSelected
                    ]}>
                      {formData.status === 'inactive' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Inactive</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Subscription Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Plan</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({
                      ...formData, 
                      subscription: {
                        ...formData.subscription as Subscription,
                        plan: 'basic',
                        amount: 999
                      }
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.subscription?.plan === 'basic' && styles.radioButtonSelected
                    ]}>
                      {formData.subscription?.plan === 'basic' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Basic (₹999/month)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({
                      ...formData, 
                      subscription: {
                        ...formData.subscription as Subscription,
                        plan: 'premium',
                        amount: 1999
                      }
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.subscription?.plan === 'premium' && styles.radioButtonSelected
                    ]}>
                      {formData.subscription?.plan === 'premium' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Premium (₹1,999/month)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({
                      ...formData, 
                      subscription: {
                        ...formData.subscription as Subscription,
                        plan: 'enterprise',
                        amount: 4999
                      }
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.subscription?.plan === 'enterprise' && styles.radioButtonSelected
                    ]}>
                      {formData.subscription?.plan === 'enterprise' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Enterprise (₹4,999/month)</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Subscription Status</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({
                      ...formData, 
                      subscription: {
                        ...formData.subscription as Subscription,
                        status: 'active'
                      }
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.subscription?.status === 'active' && styles.radioButtonSelected
                    ]}>
                      {formData.subscription?.status === 'active' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Active</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => setFormData({
                      ...formData, 
                      subscription: {
                        ...formData.subscription as Subscription,
                        status: 'inactive'
                      }
                    })}
                  >
                    <View style={[
                      styles.radioButton,
                      formData.subscription?.status === 'inactive' && styles.radioButtonSelected
                    ]}>
                      {formData.subscription?.status === 'inactive' && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Inactive</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Listing Limit</Text>
                <TextInput
                  style={styles.input}
                  value={formData.subscription?.listingLimit?.toString() || "10"}
                  onChangeText={(text) => {
                    const listingLimit = parseInt(text) || 10;
                    setFormData({
                      ...formData,
                      subscription: {
                        ...formData.subscription as Subscription,
                        listingLimit
                      }
                    });
                  }}
                  placeholder="Enter listing limit"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update Dealer' : 'Add Dealer'}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 4,
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
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
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
  dealerCompany: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
  pendingText: {
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
  subscriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subscriptionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subscriptionItem: {
    width: '50%',
    marginBottom: 8,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  miniStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '500',
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
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
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
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
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
  formContainer: {
    padding: 16,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioContainer: {
    marginTop: 8,
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