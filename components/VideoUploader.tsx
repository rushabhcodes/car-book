// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// import { Video, X } from 'lucide-react-native';
// import * as ImagePicker from 'expo-image-picker';
// import colors from '@/constants/colors';

// interface VideoUploaderProps {
//   videoUri: string;
//   onVideoSelected: (uri: string) => void;
//   onVideoRemoved: () => void;
// }

// export default function VideoUploader({
//   videoUri,
//   onVideoSelected,
//   onVideoRemoved,
// }: VideoUploaderProps) {
//   const pickVideo = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ['videos'],
//       allowsEditing: true,
//       aspect: [16, 9],
//       quality: 0.8,
//       videoMaxDuration: 60,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       onVideoSelected(result.assets[0].uri);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Vehicle Video</Text>
//         <Text style={styles.subtitle}>Upload a short video (max 60 seconds)</Text>
//       </View>

//       {videoUri ? (
//         <View style={styles.videoContainer}>
//           {Platform.OS === 'web' ? (
//             <video
//               src={videoUri}
//               style={{ width: '100%', height: 200, borderRadius: 8 }}
//               controls
//             />
//           ) : (
//             <View style={styles.videoPlaceholder}>
//               <Text style={styles.videoText}>Video Selected</Text>
//             </View>
//           )}
//           <TouchableOpacity
//             style={styles.removeButton}
//             onPress={onVideoRemoved}
//           >
//             <X size={16} color="#FFF" />
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <TouchableOpacity style={styles.addButton} onPress={pickVideo}>
//           <Video size={24} color={colors.primary} />
//           <Text style={styles.addButtonText}>Add Video</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 16,
//   },
//   header: {
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     marginTop: 2,
//   },
//   videoContainer: {
//     position: 'relative',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   videoPlaceholder: {
//     width: '100%',
//     height: 200,
//     backgroundColor: colors.inputBackground,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   videoText: {
//     color: colors.text,
//     fontSize: 16,
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   addButton: {
//     width: '100%',
//     height: 120,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderStyle: 'dashed',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.inputBackground,
//   },
//   addButtonText: {
//     color: colors.primary,
//     fontSize: 14,
//     marginTop: 4,
//   },
// });