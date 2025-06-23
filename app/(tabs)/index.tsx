import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCarListingStore } from '@/store/carListingStore';
import { useDealerStore } from '@/store/dealerStore';
import { CarListing } from '@/types/car';
import * as Haptics from 'expo-haptics';
import { Car, Edit, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ListingsScreen() {
  const { user } = useAuthStore();
  const { dealers } = useDealerStore();
  const { listings, deleteListing } = useCarListingStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [showAllListings, setShowAllListings] = useState(true);
  
  // Filter listings based on the toggle
  const filteredListings = showAllListings 
    ? listings 
    : listings.filter(listing => listing.dealerId === user?.id);

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer ? dealer.name : 'Unknown Dealer';
  };

  const handleViewDetails = (listing: CarListing) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const handleEdit = (listing: CarListing) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Edit Listing",
      "This feature is coming soon!",
      [{ text: "OK" }]
    );
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteListing(id);
            setModalVisible(false);
            Alert.alert("Deleted", "Listing has been deleted.");
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: CarListing }) => {
    const isOwnListing = item.dealerId === user?.id;
    
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.image} />
          ) : (
            <View style={styles.noImageContainer}>
              <Car size={40} color={colors.textSecondary} />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={[
            styles.statusBadge,
            item.status === 'approved' ? styles.approvedBadge :
            item.status === 'rejected' ? styles.rejectedBadge :
            styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'approved' ? styles.approvedText :
              item.status === 'rejected' ? styles.rejectedText :
              styles.pendingText
            ]}>
              {item.status === 'approved' ? 'Approved' :
               item.status === 'rejected' ? 'Rejected' : 'Pending'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.brand} {item.model}</Text>
          <Text style={styles.subtitle}>{item.manufacturingYear} • {item.transmissionType} • {item.fuelType}</Text>
          
          {!isOwnListing && (
            <View style={styles.dealerContainer}>
              <Text style={styles.dealerLabel}>Listed by:</Text>
              <Text style={styles.dealerName}>{getDealerName(item.dealerId)}</Text>
            </View>
          )}
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>KM Driven</Text>
              <Text style={styles.detailValue}>{item.kilometersDriven || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Owner</Text>
              <Text style={styles.detailValue}>{item.ownershipHistory || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>RTO</Text>
              <Text style={styles.detailValue}>{item.rtoNumber?.split(' - ')[0] || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Asking Price</Text>
            <Text style={styles.price}>₹{parseInt(item.askingPrice || '0').toLocaleString('en-IN')}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]} 
              onPress={() => handleViewDetails(item)}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            
            {isOwnListing && (
              <View style={styles.actionButtonsGroup}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => handleEdit(item)}
                >
                  <Edit size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Car size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Listings Yet</Text>
      <Text style={styles.emptySubtitle}>
        {showAllListings 
          ? "There are no car listings available yet" 
          : "Your car listings will appear here"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showAllListings && styles.filterButtonActive
          ]}
          onPress={() => setShowAllListings(true)}
        >
          <Text style={[
            styles.filterButtonText,
            showAllListings && styles.filterButtonTextActive
          ]}>All Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showAllListings && styles.filterButtonActive
          ]}
          onPress={() => setShowAllListings(false)}
        >
          <Text style={[
            styles.filterButtonText,
            !showAllListings && styles.filterButtonTextActive
          ]}>My Listings</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
      />
      
      {selectedListing && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Listing Details</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.imageGallery}>
                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedListing.images.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.galleryImage} />
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noGalleryImageContainer}>
                      <Car size={40} color={colors.textSecondary} />
                      <Text style={styles.noImageText}>No Images Available</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Vehicle Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Brand & Model:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.brand} {selectedListing.model}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Manufacturing Year:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.manufacturingYear}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Registration Year:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.registrationYear}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Transmission:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.transmissionType}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Fuel Type:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.fuelType}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Color:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.color}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>RTO:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.rtoNumber}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Kilometers Driven:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.kilometersDriven} km</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Ownership:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.ownershipHistory}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Insurance Details</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Insurance Type:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.insuranceType}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Validity:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.insuranceValidity ? formatDate(selectedListing.insuranceValidity) : 'N/A'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Pricing</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Asking Price:</Text>
                    <Text style={styles.priceValue}>₹{parseInt(selectedListing.askingPrice || '0').toLocaleString('en-IN')}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Offered Price:</Text>
                    <Text style={styles.detailRowValue}>₹{parseInt(selectedListing.offeredPrice || '0').toLocaleString('en-IN')}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>You Can Offer:</Text>
                    <Text style={styles.detailRowValue}>₹{parseInt(selectedListing.youCanOffer || '0').toLocaleString('en-IN')}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Contact Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Dealer:</Text>
                    <Text style={styles.detailRowValue}>{getDealerName(selectedListing.dealerId)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>WhatsApp:</Text>
                    <Text style={styles.detailRowValue}>{selectedListing.whatsappNumber}</Text>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Listing Status</Text>
                  
                  <View style={[
                    styles.statusContainer,
                    selectedListing.status === 'approved' ? styles.approvedContainer :
                    selectedListing.status === 'rejected' ? styles.rejectedContainer :
                    styles.pendingContainer
                  ]}>
                    <Text style={[
                      styles.statusDetailText,
                      selectedListing.status === 'approved' ? styles.approvedText :
                      selectedListing.status === 'rejected' ? styles.rejectedText :
                      styles.pendingText
                    ]}>
                      {selectedListing.status === 'approved' ? 'Approved' :
                       selectedListing.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              {selectedListing.dealerId === user?.id && (
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.editModalButton]} 
                    onPress={() => {
                      handleEdit(selectedListing);
                      setModalVisible(false);
                    }}
                  >
                    <Edit size={16} color="#FFF" />
                    <Text style={styles.editModalButtonText}>Edit Listing</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteModalButton]} 
                    onPress={() => handleDelete(selectedListing.id)}
                  >
                    <Trash2 size={16} color="#FFF" />
                    <Text style={styles.deleteModalButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
  imageContainer: {
    height: 180,
    backgroundColor: colors.inputBackground,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  approvedText: {
    color: colors.success,
  },
  rejectedText: {
    color: colors.error,
  },
  pendingText: {
    color: colors.secondary,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dealerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dealerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dealerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  actionButtonsGroup: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: colors.error,
    width: 36,
    height: 36,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
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
    maxHeight: '90%',
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
    maxHeight: 500,
  },
  imageGallery: {
    height: 200,
    marginBottom: 16,
  },
  galleryImage: {
    width: 280,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
  noGalleryImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  approvedContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  rejectedContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pendingContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusDetailText: {
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editModalButton: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  deleteModalButton: {
    backgroundColor: colors.error,
    marginLeft: 8,
  },
  editModalButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  deleteModalButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
});