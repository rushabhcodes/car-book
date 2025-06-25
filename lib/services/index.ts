export { authService } from './authService';
export { carListingService } from './carListingService';
export { dealerService } from './dealerService';

// Also export as a single object for convenience
import { authService } from './authService';
import { carListingService } from './carListingService';
import { dealerService } from './dealerService';

export default {
  auth: authService,
  carListing: carListingService,
  dealer: dealerService,
};
