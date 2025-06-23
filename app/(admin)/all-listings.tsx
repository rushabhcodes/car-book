import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useCarListingStore } from '@/store/carListingStore';
import { useDealerStore } from '@/store/dealerStore';
import { Car, Check, X, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { CarListing } from '@/types/car';

export default function AllListingsScreen() {
  const { listings, updateListing, deleteListing } = useCarListingStore();
  const { dealers } = useDealerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Filter listings based on status
  const filteredListings = filterStatus === 'all' 
    ? listings 
    : listings.filter(listing => listing.status === filterStatus);

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer ? dealer.name : 'Unknown Dealer';
  };

  const handleViewDetails = (listing: CarListing) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const handleApprove = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    
    const updatedListing: CarListing = { 
      ...listing, 
      status: 'approved' as const 
    };
    updateListing(id, updatedListing);
    setModalVisible(false);
    Alert.alert("Success", "Listing has been approved");
  };

  const handleReject = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    
    const updatedListing: CarListing = { 
      ...listing, 
      status: 'rejected' as const 
    };
    updateListing(id, updatedListing);
    setModalVisible(false);
    Alert.alert("Success", "Listing has been rejected");
  };

  const handleDelete = (id: string) => {
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
            Alert.alert("Deleted", "Listing has been deleted");
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
          
          <View style={styles.dealerContainer}>
            <Text style={styles.dealerLabel}>Listed by:</Text>
            <Text style={styles.dealerName}>{getDealerName(item.dealerId)}</Text>
          </View>
          
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
          
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'all' && styles.filterButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'pending' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'pending' && styles.filterButtonTextActive
            ]}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'approved' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('approved')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'approved' && styles.filterButtonTextActive
            ]}>Approved</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'rejected' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('rejected')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'rejected' && styles.filterButtonTextActive
            ]}>Rejected</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all' 
                ? "There are no car listings available yet" 
                : `No ${filterStatus} listings found`}
            </Text>
          </View>
        )}
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
              
              <View style={styles.modalFooter}>
                {selectedListing.status === 'pending' && (
                  <>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.approveButton]} 
                      onPress={() => handleApprove(selectedListing.id)}
                    >
                      <Check size={16} color="#FFF" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.rejectButton]} 
                      onPress={() => handleReject(selectedListing.id)}
                    >
                      <X size={16} color="#FFF" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]} 
                  onPress={() => handleDelete(selectedListing.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
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
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  approveButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  rejectButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
});