import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';

interface DatePickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onValueChange,
  placeholder = 'Select a date',
  error,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      onValueChange(formattedDate);
    }
  };

  const [showPicker, setShowPicker] = useState(false);

  const showDatepicker = () => {
    setShowPicker(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dateButton, error ? styles.dateButtonError : null]}
        onPress={showDatepicker}
      >
        <Text style={[styles.dateText, !value ? styles.placeholderText : null]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Calendar size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && Platform.OS === 'web' && (
        <input
          type="date"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          style={{ display: 'none' }}
          ref={(input) => {
            if (input) {
              input.click();
              input.onblur = () => setShowPicker(false);
            }
          }}
        />
      )}

      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

// Mock component for DateTimePicker since we can't import it directly
// In a real app, you would use @react-native-community/datetimepicker
const DateTimePicker = ({ value, mode, display, onChange }: any) => {
  // This is just a placeholder
  return null;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonError: {
    borderColor: colors.error,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});