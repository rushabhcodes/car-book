import colors from '@/constants/colors';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AlertBannerProps {
  count?: number;
  message: string;
  actionText: string;
  onPress: () => void;
  icon: LucideIcon;
  visible?: boolean;
  backgroundColor?: string;
  iconColor?: string;
}

export default function AlertBanner({
  count,
  message,
  actionText,
  onPress,
  icon: Icon,
  visible = true,
  backgroundColor = 'rgba(245, 158, 11, 0.1)',
  iconColor = colors.secondary,
}: AlertBannerProps) {
  if (!visible) return null;

  const displayMessage = count !== undefined 
    ? `${count} ${message}${count > 1 ? 's' : ''}` 
    : message;

  return (
    <TouchableOpacity 
      style={[styles.alertBanner, { backgroundColor }]}
      onPress={onPress}
    >
      <Icon size={20} color={iconColor} />
      <Text style={styles.alertText}>
        {displayMessage}
      </Text>
      <Text style={styles.alertAction}>{actionText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  alertText: {
    flex: 1,
    color: colors.text,
    marginLeft: 8,
  },
  alertAction: {
    color: colors.secondary,
    fontWeight: '600',
  },
});
