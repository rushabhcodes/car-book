import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Mic, Play, Square, Trash2 } from 'lucide-react-native';
import colors from '@/constants/colors';

interface AudioRecorderProps {
  label: string;
  description: string;
  audioUri: string;
  onAudioRecorded: (uri: string) => void;
  onAudioRemoved: () => void;
}

export default function AudioRecorder({
  label,
  description,
  audioUri,
  onAudioRecorded,
  onAudioRemoved,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // These functions would use expo-av in a real implementation
  const startRecording = async () => {
    if (Platform.OS === 'web') {
      alert('Audio recording is not supported on web');
      return;
    }
    
    setIsRecording(true);
    // Simulate recording for demo purposes
    setTimeout(() => {
      setIsRecording(false);
      // Mock a recorded audio URI
      onAudioRecorded('https://example.com/audio.mp3');
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playAudio = () => {
    if (!audioUri) return;
    setIsPlaying(true);
    // Simulate playing for demo purposes
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const stopAudio = () => {
    setIsPlaying(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>

      <View style={styles.controls}>
        {audioUri ? (
          <>
            <View style={styles.audioIndicator}>
              <Text style={styles.audioText}>Audio Recorded</Text>
            </View>
            <View style={styles.buttonGroup}>
              {isPlaying ? (
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={stopAudio}
                >
                  <Square size={20} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton]}
                  onPress={playAudio}
                >
                  <Play size={20} color="#FFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.controlButton, styles.deleteButton]}
                onPress={onAudioRemoved}
              >
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {isRecording ? (
              <TouchableOpacity
                style={[styles.recordButton, styles.recordingButton]}
                onPress={stopRecording}
              >
                <Square size={20} color="#FFF" />
                <Text style={styles.recordButtonText}>Stop Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
              >
                <Mic size={20} color="#FFF" />
                <Text style={styles.recordButtonText}>Record Audio</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  audioIndicator: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  audioText: {
    color: colors.text,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  playButton: {
    backgroundColor: colors.success,
  },
  stopButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});