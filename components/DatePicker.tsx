import colors from '@/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [showPicker, setShowPicker] = useState(false);

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
        <View style={styles.webDatePicker}>
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value);
              setShowPicker(false);
            }}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              fontSize: 16,
              backgroundColor: colors.inputBackground,
            }}
            autoFocus
            onBlur={() => setShowPicker(false)}
          />
        </View>
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
  webDatePicker: {
    marginTop: 8,
  },
});