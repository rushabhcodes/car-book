import DatePicker from '@/components/DatePicker';
import FormInput from '@/components/FormInput';
import FormPicker from '@/components/FormPicker';
import FormSection from '@/components/FormSection';
import MediaUploader from '@/components/MediaUploader';
import { useAuthStore } from '@/store/authStore';
import { useCarListingStore } from '@/store/carListingStore';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// import VideoUploader from '@/components/VideoUploader';
import {
  brands,
  colors as carColors,
  fuelTypes,
  insuranceTypes,
  ownershipOptions,
  rtoNumbers,
  transmissionTypes
} from '@/constants/carData';
import colors from '@/constants/colors';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import * as Haptics from 'expo-haptics';

export default function ListCarScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuthStore();
  const { getCurrentUserListingLimit } = useSubscriptionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    form, 
    errors, 
    setFormField, 
    addImage, 
    removeImage, 
    // setVideo, 
    validateForm, 
    submitListing,
    listings
  } = useCarListingStore();

  // Get dealer's listing limit
  const listingLimit = getCurrentUserListingLimit();
  
  // Count dealer's current listings
  const dealerListingsCount = listings.filter(listing => listing.dealerId === user?.id).length;

  const handleSubmit = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Check if dealer has reached their listing limit
    if (dealerListingsCount >= listingLimit) {
      Alert.alert(
        "Listing Limit Reached",
        `You have reached your limit of ${listingLimit} listings. Please contact admin to upgrade your subscription.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Set the dealer ID before submitting
    setFormField('dealerId', user?.id || '');
    setFormField('status', 'pending');
    
    const isValid = validateForm();
    if (isValid) {
      setIsSubmitting(true);
      
      try {
        const success = await submitListing();
        if (success) {
          Alert.alert(
            "Success!",
            "Your car has been listed successfully and is pending approval.",
            [
              { 
                text: "View Listings", 
                
              },
              { 
                text: "OK", 
                style: "default" 
              }
            ]
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to submit listing. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Find the first error and scroll to it
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && scrollViewRef.current) {
        // This is a simplified approach - in a real app you'd need refs for each field
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
      Alert.alert(
        "Validation Error",
        "Please check the form for errors and try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listingLimitContainer}>
          <Text style={styles.listingLimitText}>
            Listing {dealerListingsCount} of {listingLimit} available
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(dealerListingsCount / listingLimit) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <FormSection title="Vehicle Identity">
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <FormInput
                label="Registration Year"
                value={form.registrationYear}
                onChangeText={(text) => setFormField('registrationYear', text)}
                placeholder="e.g. 2020"
                keyboardType="numeric"
                error={errors.registrationYear}
                maxLength={4}
              />
            </View>
            <View style={styles.halfColumn}>
              <FormInput
                label="Manufacturing Year"
                value={form.manufacturingYear}
                onChangeText={(text) => setFormField('manufacturingYear', text)}
                placeholder="e.g. 2019"
                keyboardType="numeric"
                error={errors.manufacturingYear}
                maxLength={4}
              />
            </View>
          </View>

          <FormPicker
            label="Brand"
            value={form.brand}
            onValueChange={(value) => setFormField('brand', value)}
            items={brands}
            error={errors.brand}
          />

          <FormInput
            label="Model"
            value={form.model}
            onChangeText={(text) => setFormField('model', text)}
            placeholder="e.g. Swift, City, Creta"
            error={errors.model}
          />

          <FormPicker
            label="Transmission Type"
            value={form.transmissionType}
            onValueChange={(value) => setFormField('transmissionType', value)}
            items={transmissionTypes}
            error={errors.transmissionType}
          />

          <FormPicker
            label="RTO Number"
            value={form.rtoNumber}
            onValueChange={(value) => setFormField('rtoNumber', value)}
            items={rtoNumbers}
            error={errors.rtoNumber}
          />
        </FormSection>

        <FormSection title="Media Upload">
          <MediaUploader
            images={form.images}
            onAddImage={addImage}
            onRemoveImage={removeImage}
            error={errors.images}
          />

          {/* <VideoUploader
            videoUri={form.video || ''}
            onVideoSelected={(uri) => setFormField('video', uri)}
            onVideoRemoved={() => setFormField('video', '')}
          /> */}
        </FormSection>

        <FormSection title="Vehicle Details">
          <FormPicker
            label="Color"
            value={form.color}
            onValueChange={(value) => setFormField('color', value)}
            items={carColors}
            error={errors.color}
          />

          <FormPicker
            label="Ownership History"
            value={form.ownershipHistory}
            onValueChange={(value) => setFormField('ownershipHistory', value)}
            items={ownershipOptions}
            error={errors.ownershipHistory}
          />

          <FormInput
            label="Kilometers Driven"
            value={form.kilometersDriven}
            onChangeText={(text) => setFormField('kilometersDriven', text)}
            placeholder="e.g. 25000"
            keyboardType="numeric"
            error={errors.kilometersDriven}
          />

          <FormPicker
            label="Fuel Type"
            value={form.fuelType}
            onValueChange={(value) => setFormField('fuelType', value)}
            items={fuelTypes}
            error={errors.fuelType}
          />

          <DatePicker
            label="Insurance Validity"
            value={form.insuranceValidity}
            onValueChange={(value) => setFormField('insuranceValidity', value)}
            error={errors.insuranceValidity}
          />

          <FormPicker
            label="Insurance Type"
            value={form.insuranceType}
            onValueChange={(value) => setFormField('insuranceType', value)}
            items={insuranceTypes}
            error={errors.insuranceType}
          />
        </FormSection>

        <FormSection title="Pricing">
          <FormInput
            label="Asking Price (₹)"
            value={form.askingPrice}
            onChangeText={(text) => setFormField('askingPrice', text)}
            placeholder="e.g. 500000"
            keyboardType="numeric"
            error={errors.askingPrice}
          />

          <FormInput
            label="WhatsApp Contact Number"
            value={form.whatsappNumber}
            onChangeText={(text) => setFormField('whatsappNumber', text)}
            placeholder="10-digit number"
            keyboardType="phone-pad"
            error={errors.whatsappNumber}
            maxLength={10}
          />
        </FormSection>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (dealerListingsCount >= listingLimit || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={dealerListingsCount >= listingLimit || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFF" style={styles.loadingSpinner} />
              <Text style={styles.submitButtonText}>Listing Your Car...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>List My Car</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  listingLimitContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  listingLimitText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.inputBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfColumn: {
    flex: 1,
    paddingHorizontal: 6,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    boxShadow: '0px 4px 8px rgba(16,185,129,0.2)',
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 12,
  },
});