import React, { useState, useEffect, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, StatusBar, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera } from 'expo-camera';
import { router } from 'expo-router'; 
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const DetectionScreen: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>('back'); 
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<Camera>(null);
  const speak = (text: string): void => {
    Speech.speak(text, { language: 'en', pitch: 1, rate: 1 });
  };

  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnimation]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black p-4`}>
        <Text style={tw`text-white text-lg text-center mb-4`}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" color="#4B0082" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => {
      const newFacing = prevFacing === 'back' ? 'front' : 'back';
      console.log('Toggling camera to:', newFacing);
      speak('Camera flipped to ' + newFacing);
      return newFacing;
    });
  };

  const captureAndDetectCurrency = async () => {
    try {
      const capturedImage = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.05 });
      const base64Content = capturedImage.base64;

      if (!base64Content) {
        throw new Error('Base64 content is empty or malformed.');
      }

      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBKm-24tkg_PAXjDky_YMSG_EvxeSZUWn0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Content },
            features: [{ type: 'TEXT_DETECTION' }],
          }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.responses && data.responses.length > 0) {
        const detectedText = data.responses[0].fullTextAnnotation.text || '';
        const currencyPattern = /\b(10|20|50|100|200|500)\b/g;
        const matches = detectedText.match(currencyPattern);
        const uniqueCurrencies = [...new Set(matches)];

        if (uniqueCurrencies.length > 0) {
          console.log('Detected Currency:', uniqueCurrencies);
          speak(`Detected currency: ${uniqueCurrencies.join(', ')}`);
        } else {
          speak('No currency detected. Please try again.');
        }
      } else {
        speak('No text detected. Please try again.');
      }
    } catch (error) {
      console.error('Error detecting currency:', error);
      speak('Error detecting currency. Please try again.');
    }
  };

  const scanBarPosition = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <View style={tw`flex-1 bg-black`}>
      <StatusBar barStyle="light-content" backgroundColor="#4B0082" />

      <View style={tw`p-4 pt-14`}>
        <Text style={tw`text-white text-3xl font-bold text-center`}>VisionX</Text>
        <Text style={tw`text-white text-lg font-semibold text-center mt-2`}>
          Currency Detection
        </Text>
      </View>

      <View style={tw`flex items-center mb-1`}>
        <LinearGradient
          colors={['#4B0082', '#8A2BE2']}
          style={tw`rounded-full p-2 shadow-lg`}
        >
          <TouchableOpacity
            style={tw`px-8 py-3 bg-transparent rounded-full`}
            onPress={() => {
              speak('Back to home screen');
              router.push('/');
            }}
          >
            <Text style={tw`text-white text-lg font-semibold text-center`}>Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={tw`flex-1 items-center justify-center`}>
        <CameraView style={tw`w-full h-96 rounded-lg overflow-hidden`} facing={facing} ref={cameraRef}>
          <Animated.View
            style={[
              tw`absolute top-0 left-0 right-0 h-1 bg-green-400`,
              { transform: [{ translateY: scanBarPosition }] },
            ]}
          />
          <View style={tw`flex-1 justify-end mb-4`}>
            <TouchableOpacity
              style={tw`bg-purple-600 rounded-full py-2 px-4 self-center`}
              onPress={toggleCameraFacing}
            >
              <Text style={tw`text-white text-xl font-bold`}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>

        <View style={tw`mt-4`}>
          <TouchableOpacity
            style={tw`bg-gradient-to-r bg-blue-700 rounded-full py-5 px-10 self-center w-3/4`} 
            onPress={captureAndDetectCurrency}
          >
            <Text style={tw`text-white text-xl font-bold text-center`}>Detect Currency</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`p-4`}>
        <Text style={tw`text-white text-center`}>© 2024 VisionX. All rights reserved.</Text>
      </View>
    </View>
  );
};

export default DetectionScreen;
