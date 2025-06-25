import colors from '@/constants/colors';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface QuickActionButtonProps {
  icon: LucideIcon;
  text: string;
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function QuickActionButton({
  icon: Icon,
  text,
  onPress,
  iconColor = colors.primary,
  iconSize = 24,
}: QuickActionButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.actionButton}
      onPress={onPress}
    >
      <Icon size={iconSize} color={iconColor} />
      <Text style={styles.actionButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
});
