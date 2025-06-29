import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { useCarListingStore } from "@/store/carListingStore";
import { useDealerStore } from "@/store/dealerStore";
import { CarListing } from "@/types/car";
import * as Haptics from "expo-haptics";
import { Car, Edit, Filter, MessageCircle, Trash2, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ListingsScreen() {
  const { user } = useAuthStore();
  const { dealers } = useDealerStore();
  const { listings, deleteListing, fetchListings } = useCarListingStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(
    null
  );
  const [showAllListings, setShowAllListings] = useState(true);
  const [approvedListings, setApprovedListings] = useState<CarListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    rto: "",
    color: "",
    brand: "",
    fuelType: "",
    transmissionType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const loadListings = async () => {
      if (showAllListings) {
        await fetchListings();
      } else {
        // Fetch user's own listings when switching to "My Listings"
        if (user?.id) {
          await fetchListings(user.id);
        }
      }
    };

    loadListings();
  }, [showAllListings]);

  const onRefresh = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setRefreshing(true);
    try {
      if (showAllListings) {
        const approvedData = await fetchListings();
      } else {
        // Refresh user's own listings
        if (user?.id) {
          await fetchListings(user.id);
        }
      }
    } catch (error) {
      console.error("Error refreshing listings:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter listings based on the toggle and applied filters
  const filteredListings = (() => {
    let filtered = showAllListings
      ? listings.filter((listing) => listing.status === "approved")
      : listings.filter((listing) => listing.dealerId === user?.id);

    // Apply filters
    if (filters.rto) {
      filtered = filtered.filter((listing) =>
        listing.rtoNumber?.toLowerCase().includes(filters.rto.toLowerCase())
      );
    }

    if (filters.color) {
      filtered = filtered.filter((listing) =>
        listing.color?.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((listing) =>
        listing.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.fuelType) {
      filtered = filtered.filter((listing) =>
        listing.fuelType?.toLowerCase() === filters.fuelType.toLowerCase()
      );
    }

    if (filters.transmissionType) {
      filtered = filtered.filter((listing) =>
        listing.transmissionType?.toLowerCase() === filters.transmissionType.toLowerCase()
      );
    }

    if (filters.minPrice) {
      const minPrice = parseInt(filters.minPrice);
      filtered = filtered.filter((listing) =>
        parseInt(listing.askingPrice || "0") >= minPrice
      );
    }

    if (filters.maxPrice) {
      const maxPrice = parseInt(filters.maxPrice);
      filtered = filtered.filter((listing) =>
        parseInt(listing.askingPrice || "0") <= maxPrice
      );
    }

    return filtered;
  })();

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find((d) => d.id === dealerId);
    return dealer ? dealer.name : "Unknown Dealer";
  };

  const handleViewDetails = (listing: CarListing) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const handleEdit = (listing: CarListing) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Edit Listing", "This feature is coming soon!", [
      { text: "OK" },
    ]);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== "web") {
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
          },
        },
      ]
    );
  };

  const handleWhatsAppContact = (listing: CarListing) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const dealerName = getDealerName(listing.dealerId);
    const carInfo = `${listing.brand} ${listing.model} (${listing.manufacturingYear})`;
    const price = `₹${parseInt(listing.askingPrice || "0").toLocaleString("en-IN")}`;
    
    const message = `Hi ${dealerName}, I'm interested in your ${carInfo} listed for ${price}. Could you please share more details?`;
    
    const whatsappNumber = listing.whatsappNumber?.replace(/\D/g, ''); // Remove non-numeric characters
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch((err) => {
      console.error('Error opening WhatsApp:', err);
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed.');
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      rto: "",
      color: "",
      brand: "",
      fuelType: "",
      transmissionType: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const getUniqueValues = (key: keyof CarListing) => {
    const values = listings
      .map(listing => listing[key])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values as string[];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
          <View
            style={[
              styles.statusBadge,
              item.status === "approved"
                ? styles.approvedBadge
                : item.status === "rejected"
                ? styles.rejectedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "approved"
                  ? styles.approvedText
                  : item.status === "rejected"
                  ? styles.rejectedText
                  : styles.pendingText,
              ]}
            >
              {item.status === "approved"
                ? "Approved"
                : item.status === "rejected"
                ? "Rejected"
                : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title}>
            {item.brand} {item.model}
          </Text>
          <Text style={styles.subtitle}>
            {item.manufacturingYear} • {item.transmissionType} • {item.fuelType}
          </Text>

          {!isOwnListing && (
            <View style={styles.dealerContainer}>
              <Text style={styles.dealerLabel}>Listed by:</Text>
              <Text style={styles.dealerName}>
                {getDealerName(item.dealerId)}
              </Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>KM Driven</Text>
              <Text style={styles.detailValue}>
                {item.kilometersDriven || "N/A"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Owner</Text>
              <Text style={styles.detailValue}>
                {item.ownershipHistory || "N/A"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>RTO</Text>
              <Text style={styles.detailValue}>
                {item.rtoNumber?.split(" - ")[0] || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Asking Price</Text>
            <Text style={styles.price}>
              ₹{parseInt(item.askingPrice || "0").toLocaleString("en-IN")}
            </Text>
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
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showAllListings && styles.filterButtonActive,
            ]}
            onPress={() => setShowAllListings(true)}
          >
            <Text
              style={[
                styles.filterButtonText,
                showAllListings && styles.filterButtonTextActive,
              ]}
            >
              All Listings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              !showAllListings && styles.filterButtonActive,
            ]}
            onPress={() => setShowAllListings(false)}
          >
            <Text
              style={[
                styles.filterButtonText,
                !showAllListings && styles.filterButtonTextActive,
              ]}
            >
              My Listings
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={colors.primary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
                  {selectedListing.images &&
                  selectedListing.images.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {selectedListing.images.map((uri, index) => (
                        <Image
                          key={index}
                          source={{ uri }}
                          style={styles.galleryImage}
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noGalleryImageContainer}>
                      <Car size={40} color={colors.textSecondary} />
                      <Text style={styles.noImageText}>
                        No Images Available
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Vehicle Information
                  </Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Brand & Model:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.brand} {selectedListing.model}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>
                      Manufacturing Year:
                    </Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.manufacturingYear}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>
                      Registration Year:
                    </Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.registrationYear}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Transmission:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.transmissionType}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Fuel Type:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.fuelType}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Color:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.color}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>RTO:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.rtoNumber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>
                      Kilometers Driven:
                    </Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.kilometersDriven} km
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Ownership:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.ownershipHistory}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Insurance Details
                  </Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Insurance Type:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.insuranceType}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Validity:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.insuranceValidity
                        ? formatDate(selectedListing.insuranceValidity)
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Pricing</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Asking Price:</Text>
                    <Text style={styles.priceValue}>
                      ₹
                      {parseInt(
                        selectedListing.askingPrice || "0"
                      ).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Contact Information
                  </Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Dealer:</Text>
                    <Text style={styles.detailRowValue}>
                      {getDealerName(selectedListing.dealerId)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>WhatsApp:</Text>
                    <Text style={styles.detailRowValue}>
                      {selectedListing.whatsappNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Listing Status</Text>

                  <View
                    style={[
                      styles.statusContainer,
                      selectedListing.status === "approved"
                        ? styles.approvedContainer
                        : selectedListing.status === "rejected"
                        ? styles.rejectedContainer
                        : styles.pendingContainer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusDetailText,
                        selectedListing.status === "approved"
                          ? styles.approvedText
                          : selectedListing.status === "rejected"
                          ? styles.rejectedText
                          : styles.pendingText,
                      ]}
                    >
                      {selectedListing.status === "approved"
                        ? "Approved"
                        : selectedListing.status === "rejected"
                        ? "Rejected"
                        : "Pending Approval"}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                {/* WhatsApp Contact Button - Always visible */}
                <TouchableOpacity
                  style={[styles.modalButton, styles.whatsappButton]}
                  onPress={() => handleWhatsAppContact(selectedListing)}
                >
                  <MessageCircle size={16} color="#FFF" />
                  <Text style={styles.whatsappButtonText}>Contact on WhatsApp</Text>
                </TouchableOpacity>

                {/* Edit and Delete buttons - Only for listing owner */}
                {selectedListing.dealerId === user?.id && (
                  <>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.editModalButton]}
                      onPress={() => {
                        handleEdit(selectedListing);
                        setModalVisible(false);
                      }}
                    >
                      <Edit size={16} color="#FFF" />
                      <Text style={styles.editModalButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteModalButton]}
                      onPress={() => handleDelete(selectedListing.id)}
                    >
                      <Trash2 size={16} color="#FFF" />
                      <Text style={styles.deleteModalButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Listings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter RTO (e.g., MH01, DL01)"
                  value={filters.rto}
                  onChangeText={(value) => handleFilterChange('rto', value)}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Vehicle Details</Text>
                
                <TextInput
                  style={styles.filterInput}
                  placeholder="Brand (e.g., Maruti, Honda)"
                  value={filters.brand}
                  onChangeText={(value) => handleFilterChange('brand', value)}
                  placeholderTextColor={colors.textSecondary}
                />

                <TextInput
                  style={styles.filterInput}
                  placeholder="Color (e.g., White, Black)"
                  value={filters.color}
                  onChangeText={(value) => handleFilterChange('color', value)}
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>Fuel Type</Text>
                  <View style={styles.pickerOptions}>
                    {["", "Petrol", "Diesel", "CNG", "Electric"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.pickerOption,
                          filters.fuelType === option && styles.pickerOptionActive
                        ]}
                        onPress={() => handleFilterChange('fuelType', option)}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          filters.fuelType === option && styles.pickerOptionTextActive
                        ]}>
                          {option || "Any"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>Transmission</Text>
                  <View style={styles.pickerOptions}>
                    {["", "Manual", "Automatic"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.pickerOption,
                          filters.transmissionType === option && styles.pickerOptionActive
                        ]}
                        onPress={() => handleFilterChange('transmissionType', option)}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          filters.transmissionType === option && styles.pickerOptionTextActive
                        ]}>
                          {option || "Any"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[styles.filterInput, styles.priceInput]}
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChangeText={(value) => handleFilterChange('minPrice', value)}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.priceRangeSeparator}>to</Text>
                  <TextInput
                    style={[styles.filterInput, styles.priceInput]}
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChangeText={(value) => handleFilterChange('maxPrice', value)}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={[styles.filterModalButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterModalButton, styles.applyButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleContainer: {
    flexDirection: "row",
    flex: 1,
  },
  filtersButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    marginLeft: 12,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  filterButtonTextActive: {
    color: "#FFF",
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
    overflow: "hidden",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  imageContainer: {
    height: 180,
    backgroundColor: colors.inputBackground,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  rejectedBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
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
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dealerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dealerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dealerName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: "row",
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
    fontWeight: "500",
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
    fontWeight: "700",
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewButtonText: {
    color: "#FFF",
    fontWeight: "500",
  },
  actionButtonsGroup: {
    flexDirection: "row",
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    maxHeight: "90%",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
    textAlign: "right",
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  approvedContainer: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  rejectedContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  pendingContainer: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  statusDetailText: {
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  whatsappButton: {
    backgroundColor: "#25D366", // WhatsApp green color
  },
  whatsappButtonText: {
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  editModalButton: {
    backgroundColor: colors.primary,
  },
  deleteModalButton: {
    backgroundColor: colors.error,
  },
  editModalButtonText: {
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  deleteModalButtonText: {
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  // Filter Modal Styles
  filterModalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    maxHeight: "85%",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
    elevation: 5,
  },
  filterModalBody: {
    padding: 16,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  filterInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerSection: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  pickerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  pickerOptionTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  priceRangeSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterModalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  filterModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.text,
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    color: "#FFF",
    fontWeight: "500",
  },
});
