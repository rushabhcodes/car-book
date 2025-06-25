import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

/**
 * Display an alert with optional actions
 * @param title Alert title
 * @param message Alert message
 * @param actions Optional actions for the alert
 * @param cancelable Whether the alert can be dismissed (Android only)
 */
export const showAlert = (
  title: string, 
  message: string, 
  actions?: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>,
  cancelable?: boolean
): void => {
  Alert.alert(
    title,
    message,
    actions?.map(({ text, onPress, style }) => ({ text, onPress, style })),
    { cancelable }
  );
};

/**
 * Open a URL in the device's browser
 * @param url URL to open
 * @returns Promise that resolves to a boolean indicating success
 */
export const openURL = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    
    console.log(`Cannot open URL: ${url}`);
    return false;
  } catch (error) {
    console.error(`Error opening URL: ${url}`, error);
    return false;
  }
};

/**
 * Open phone dialer with a given number
 * @param phoneNumber Phone number to call
 */
export const callPhoneNumber = (phoneNumber: string): void => {
  let formattedNumber = phoneNumber.replace(/\s/g, '');
  
  if (Platform.OS === 'android') {
    openURL(`tel:${formattedNumber}`);
  } else {
    openURL(`telprompt:${formattedNumber}`);
  }
};

/**
 * Open WhatsApp with a given number
 * @param phoneNumber Phone number with country code
 * @param message Optional initial message
 */
export const openWhatsApp = (phoneNumber: string, message: string = ''): void => {
  let formattedNumber = phoneNumber.replace(/\s/g, '');
  
  if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+${formattedNumber}`;
  }
  
  const encodedMessage = encodeURIComponent(message);
  openURL(`https://wa.me/${formattedNumber}?text=${encodedMessage}`);
};

/**
 * Send an SMS to a given number
 * @param phoneNumber Phone number to send SMS to
 * @param message Optional initial message
 */
export const sendSMS = (phoneNumber: string, message: string = ''): void => {
  let formattedNumber = phoneNumber.replace(/\s/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  openURL(`sms:${formattedNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodedMessage}`);
};
