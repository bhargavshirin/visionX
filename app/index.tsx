import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, TouchableWithoutFeedback, Animated, Modal, Button } from 'react-native';
import * as Speech from 'expo-speech';
import { useBatteryLevel } from 'expo-battery';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import Voice from '@react-native-voice/voice';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFallDetection } from './js/useFallDetection';
import { stringify } from 'flatted';

type ButtonHandler = () => void;
const HomeScreen: React.FC = () => {
  useFallDetection();
  const [isVoicePopupVisible, setIsVoicePopupVisible] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isSOSModalVisible, setIsSOSModalVisible] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const batteryLevel = useBatteryLevel();
  const [voiceText, setVoiceText] = useState<string>('');




  const GOOGLE_CLOUD_API_KEY = 'AIzaSyBKm-24tkg_PAXjDky_YMSG_EvxeSZUWn0';
  const handleSpeechToText = async (audioData) => {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: stringify({
            config: {
              encoding: 'LINEAR16', 
              sampleRateHertz: 16000, 
              languageCode: 'en-US',
            },
            audio: {
              content: audioData, 
            },
          }),
        }
      );
  
      const responseJson = await response.json();
      if (response.ok) {
        console.log('Recognized speech:', responseJson);
        const recognizedText = responseJson.results[0].alternatives[0].transcript;
        setVoiceText(recognizedText);
        navigateBasedOnCommand(recognizedText);
      } else {
        console.error('Error in speech recognition:', responseJson.error.message);
      }
    } catch (error) {
      console.error('Error calling Speech-to-Text API:', error);
    }
  };
  
  
const navigateBasedOnCommand = (command: string) => {
    if (command) {
        const lowerCaseCommand = command.toLowerCase();
        if (lowerCaseCommand.includes('object detection')) {
            speak('Opening object detection.');
            router.push('/detection');
        } else if (lowerCaseCommand.includes('currency detection')) {
            speak('Opening currency detection.');
            router.push('/detect-currency');
        } else if (lowerCaseCommand.includes('open settings')) {
            speak('Opening settings.');
            router.push('/settings');
        } else {
            speak('Sorry, I did not understand the command.');
        }
    } else {
        console.warn('Command is null or undefined.');
    }
};


  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        const spokenText = event.value[0];
        console.log('Recognized speech:', spokenText);
        setVoiceText(spokenText);
        navigateBasedOnCommand(spokenText);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners); 
    };
  }, []);

  const closeVoiceAssistance = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVoicePopupVisible(false));
    Speech.stop();
    Voice.stop(); 
  };



  const speak = (text: string): void => {
    Speech.speak(text, { language: 'en', pitch: 1, rate: 1 });
  };
  const texttospeech = () => {
    speak("Text to Speech activated");
    router.push('/texttospeech');
  }

  const handleSOS = async () => {
    speak("SOS activated");
    setIsSOSModalVisible(true);
    setCountdown(5);
    try {
      const response = await fetch('https://visionxserver.vercel.app/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'SOS Activated! Please assist immediately.',
        }),
      });
      const responseJson = await response.json();
      if (response.ok) {
        console.log(`Success: ${responseJson.message}`);
      } else {
        console.error(`Failed: ${responseJson.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleCancelSOS = () => {
    setIsSOSModalVisible(false);
  };
  const closeModal = () => {
    setIsSOSModalVisible(false);
  };


  const handleObjectDetection: ButtonHandler = () => {
    speak("Object detection activated");
    router.push('/detection');
    // router.push('/test');
  };

  const handleCurrencyDetection: ButtonHandler = () => {
    speak("Currency detection activated");
    router.push('/detect-currency');
  };

  const handleSettingsPress: ButtonHandler = () => {
    speak("Settings");
    router.push('/settings');
  };
  const handleSheModePress: ButtonHandler = () => {
    speak("Switched to She Mode.");
    Alert.alert("She Mode", "You have activated She Mode.");
    router.push('/women');
  };






  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
    speak("Location sharing activated");
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const googleMapsLink = `https://www.google.com/maps/@${latitude},${longitude},15z`;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    console.log(`Google Maps Link: ${googleMapsLink}`);

    try {
      const response = await fetch('https://visionxserver.vercel.app/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `The user is sharing Live Location.\nLocation: ${latitude}, ${longitude}\nLink: ${googleMapsLink}`,  // Include latitude and longitude in the message
        }),
      });

      const responseJson = await response.json();
      if (response.ok) {
        console.log(`Success: ${responseJson.message}`);
      } else {
        console.error(`Failed: ${responseJson.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    Alert.alert('Location', `Latitude: ${latitude}, Longitude: ${longitude}\n\nGoogle Maps Link: ${googleMapsLink}`);
  };



  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        const spokenText = event.value[0];
        console.log("Recognized speech:", spokenText); 
        setVoiceText(spokenText);
        navigateBasedOnCommand(spokenText); 
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners); 
    };
  }, []);










  useEffect(() => {
    if (isSOSModalVisible && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsSOSModalVisible(false);
    }
  }, [countdown, isSOSModalVisible]);
  useEffect(() => {
    const checkNetworkState = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected && networkState.isInternetReachable);
    };
    const interval = setInterval(checkNetworkState, 5000);

    return () => clearInterval(interval);
  }, []);
  const getBatteryIcon = (): { icon: string; color: string } => {
    if (batteryLevel === null) return { icon: 'battery-dead-outline', color: 'gray' };
    const batteryPercentage = batteryLevel * 100;
    return batteryPercentage > 21
      ? { icon: 'battery-full-outline', color: 'green' }
      : { icon: 'battery-dead-outline', color: 'red' };
  };

  const { icon, color } = getBatteryIcon();
  <Ionicons type={icon} size={32} color={color} style={tw`mr-1`} />

  const handlePressOutside = () => {
    speak("You have pressed outside the buttons");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={tw`flex-1 bg-gray-900`}>
          <View style={tw`bg-black p-4 pt-14`}>
            <Text style={tw`text-white text-2xl font-bold text-center`}>VisionX</Text>
          </View>
          <View style={tw`absolute inset-0 from-blue-500 to-purple-700`} />
          <View style={tw`flex-row items-center justify-between mb-2 mt-2 px-4`}>
            <TouchableOpacity onPress={handleSettingsPress} style={tw`flex-row items-center`}>
              <Icon name="settings" size={30} color="white" />
              <Text style={tw`text-white font-bold text-sm ml-2`}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-row items-center bg-blue-500 p-2 rounded-md`}
              onPress={handleSheModePress}
            >
              <Icon name="female" size={20} color="white" style={tw`mr-1`} />
              <Text style={tw`text-white font-bold text-sm`}>She Mode</Text>
            </TouchableOpacity>
          </View>
          <View style={tw`flex-1 items-center justify-center p-4`}>
            <TouchableOpacity
              style={tw`w-28 h-28 rounded-full bg-blue-500 shadow-lg justify-center items-center transform transition-transform duration-300 hover:scale-105`}
              onPress={handleLocationPress}
              accessible={true}
              accessibilityLabel="Location button"
              accessibilityHint="Activates location services"
              onFocus={() => speak("Location Button")}
            >
              <Icon name="location-on" size={40} color="white" />
            </TouchableOpacity>
            <View style={tw`flex-row justify-between mb-4 w-full relative`}>
              <View style={tw`absolute left-0 h-24 w-[30%] bg-black rounded-r-full ml--4`} />
              <TouchableOpacity
                style={tw`w-24 h-24 bg-white rounded-full shadow-lg transition duration-300 transform hover:scale-105 justify-center items-center`}
                onPress={handleObjectDetection}
                accessible={true}
                accessibilityLabel="Object Detection button"
                accessibilityHint="Opens object detection mode"
                onFocus={() => speak("Object Detection Button")}
              >
                <Icon name="camera-alt" size={30} color="black" />
              </TouchableOpacity>
              <View style={tw`absolute right-0 h-24 w-[30%] bg-black rounded-l-full mr--4`} />
              <TouchableOpacity
                style={tw`w-24 h-24 bg-white rounded-full shadow-lg transition duration-300 transform hover:scale-105 justify-center items-center`}
                onPress={handleCurrencyDetection}
                accessible={true}
                accessibilityLabel="Currency Detection button"
                accessibilityHint="Opens currency detection mode"
                onFocus={() => speak("Currency Detection Button")}
              >
                <Text style={tw`text-black text-3xl`}>₹</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={tw`w-28 h-28 mt-4 rounded-full bg-red-600 shadow-lg justify-center items-center transform transition-transform duration-300 hover:scale-105`}
              onPress={handleSOS}
              accessible={true}
              accessibilityLabel="SOS button"
              accessibilityHint="Activates emergency assistance"
              onFocus={() => speak("SOS Button")}
            >
              <Text style={tw`text-white text-3xl font-bold`}>SOS</Text>
            </TouchableOpacity>
            <View>
              {isSOSModalVisible && (
                <Modal transparent={true} animationType="fade">
                  <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-60`}>
                    <View style={tw`bg-white p-6 rounded-xl shadow-lg w-80 relative`}>
                      <Text style={tw`text-xl font-bold text-red-600 mb-4 text-center`}>
                        SOS Alert
                      </Text>
                      <Text style={tw`text-base text-gray-800 mb-6 text-center`}>
                        SOS will be activated in <Text style={tw`font-bold text-red-600`}>{countdown}</Text> seconds. You can cancel it.
                      </Text>
                      <TouchableOpacity
                        style={tw`bg-red-500 py-2 px-4 rounded-lg mb-4 shadow-lg`}
                        onPress={handleCancelSOS}
                      >
                        <Text style={tw`text-white text-center text-lg font-bold`}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={tw`absolute top-2 right-2 p-2`} onPress={closeModal}>
                        <Text style={tw`text-gray-500 text-lg font-bold`}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
            </View>
            <TouchableOpacity
              style={tw`w-4/5 p-5 mt-12 bg-blue-500 rounded-full shadow-lg transition duration-300 transform hover:scale-105`}
              onPress={texttospeech} 
              accessible={true}
              accessibilityLabel="Text-to-Speech button" 
              accessibilityHint="Opens text-to-speech mode"
              onFocus={() => speak("Welcome to Text-to-Speech Mode")} 
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Icon name="translate" size={24} color="white" style={tw`mr-2`} />
                <Text style={tw`text-white text-xl font-bold text-center`}>Text to Speech</Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={tw`w-4/5 p-5 mt-5 bg-red-400 rounded-full shadow-lg transition duration-300 transform hover:scale-105`}
              onPress={handleSpeechToText}
              accessible={true}
              accessibilityLabel="Voice Assistance button"
              accessibilityHint="Opens voice assistance mode"
              onFocus={() => speak("Welcome to Voice Assistance")}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Icon name="mic" size={24} color="black" style={tw`mr-2`} />
                <Text style={tw`text-black text-xl font-bold text-center`}>Voice Assistance</Text>
              </View>
            </TouchableOpacity> */}
          </View>

          <View>
            {isVoicePopupVisible && (
              <Animated.View
                style={[
                  tw`absolute bottom-0 w-full p-8 bg-black rounded-t-3xl shadow-lg`,
                  {
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <View style={tw`flex-row items-center`}>
                    <Icon name="mic" size={30} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-lg font-bold text-white`}>Listening...</Text>
                  </View>
                  <TouchableOpacity onPress={closeVoiceAssistance}>
                    <Ionicons name="close" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
          <View style={tw`bg-black p-3 items-center justify-center flex-row`}>
            <Ionicons
              name={icon}
              size={32}
              color={color}
              style={tw`mr-1`}
            />
            <Text style={tw`text-white text-md mr-4`}>
              {batteryLevel !== null ? `${(batteryLevel * 100).toFixed(0)}%` : 'Unknown'}
            </Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons
                name="wifi"
                size={20}
                color={isOnline ? 'green' : 'red'}
                style={tw`mr-2`}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default HomeScreen;