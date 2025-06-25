// import colors from '@/constants/colors';
// import { ResizeMode, Video } from 'expo-av';
// import * as ImagePicker from 'expo-image-picker';
// import { Video as VideoIcon, X } from 'lucide-react-native';
// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// interface VideoUploaderProps {
//   videoUri: string;
//   onVideoSelected: (uri: string) => void;
//   onVideoRemoved: () => void;
//   label?: string;
// }

// export default function VideoUploader({
//   videoUri,
//   onVideoSelected,
//   onVideoRemoved,
//   label = 'Add Video',
// }: VideoUploaderProps) {
//   const pickVideo = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//       allowsEditing: true,
//       aspect: [16, 9],
//       quality: 0.8,
//       videoMaxDuration: 60, // limit to 60 seconds
//     });

//     if (!result.canceled && result.assets && result.assets[0]) {
//       onVideoSelected(result.assets[0].uri);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {label && <Text style={styles.label}>{label}</Text>}
      
//       {videoUri ? (
//         <View style={styles.videoContainer}>
//           <Video
//             source={{ uri: videoUri }}
//             style={styles.video}
//             useNativeControls
//             resizeMode={ResizeMode.CONTAIN}
//             isLooping={false}
//           />
//           <TouchableOpacity 
//             style={styles.removeButton}
//             onPress={onVideoRemoved}
//           >
//             <X size={20} color={colors.error} />
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <TouchableOpacity
//           style={styles.uploadButton}
//           onPress={pickVideo}
//         >
//           <VideoIcon size={24} color={colors.primary} />
//           <Text style={styles.uploadText}>Upload Video</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: colors.text,
//     marginBottom: 6,
//   },
//   videoContainer: {
//     position: 'relative',
//     borderRadius: 8,
//     overflow: 'hidden',
//     backgroundColor: colors.inputBackground,
//     height: 200,
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   uploadButton: {
//     backgroundColor: colors.inputBackground,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderStyle: 'dashed',
//     padding: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   uploadText: {
//     color: colors.primary,
//     fontWeight: '500',
//     marginTop: 8,
//   },
// });