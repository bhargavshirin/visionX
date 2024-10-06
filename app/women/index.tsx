import React,{useState}from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, DeviceEventEmitter } from 'react-native';
import tw from 'twrnc';
import { router } from 'expo-router';
import SlideButton from 'rn-slide-button';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useFallDetection } from '../js/useFallDetection';
const HomePage = () => {
  useFallDetection();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSlideComplete = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const googleMapsLink = `https://www.google.com/maps/@${latitude},${longitude},15z`;

    try {
      const response = await fetch('https://visionxserver.vercel.app/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `ALERT SOS SOS!!!!! PLEASE HELP ME I AM IN DANGER. The user is sharing Live Location.\nLocation: ${latitude}, ${longitude}\nLink: ${googleMapsLink}`,
        }),
      });

      const responseJson = await response.json();
      if (response.ok) {
        console.log(`Success: ${responseJson.message}`);
        setIsCompleted(true); 
      } else {
        console.error(`Failed: ${responseJson.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
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
   
  };

  const handlesafetravel = async () => {
    const messageText = `Iam Travelling alone. Iam feeling unsafe. Please help me.`;

  try {
    const response = await fetch('https://visionxserver.vercel.app/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: messageText,  
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
  return (
<GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaView style={tw`flex-1 bg-gray-900`}>
    <View style={tw`bg-black pt-8 px-4 flex-row justify-between items-center`}>
      <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
        <Text style={tw`text-white text-lg mt-6`}>Back</Text>
      </TouchableOpacity>
      <View style={tw`flex-row items-center mt-6`}>
        <Text style={tw`text-white text-xl font-bold`}>VisionX for</Text>
        <Icon name="female" size={30} color="white" />
      </View>
    </View>
    <ScrollView contentContainerStyle={tw`p-9 bg-gray-900 flex-grow`}>
      <Text style={tw`text-lg font-semibold text-white mb-5`}>
        Welcome Back, Stay Safe!
      </Text>
      <View style={tw`flex flex-column items-center gap-6 mb-5`}>
        <TouchableOpacity
          style={tw`bg-pink-500 w-22 h-22 rounded-full mb-4 shadow-lg items-center justify-center`}
          onPress={() => router.push('/women/chat')}
        >
          <Icon name="chat" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-blue-500 w-22 h-22 rounded-full mb-4 shadow-lg items-center justify-center`}
          onPress={() => router.push('/women/calls')}
        >
          <Icon name="call" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-green-500 w-22 h-22 rounded-full mb-4 shadow-lg items-center justify-center`}
          onPress={() => router.push('/women/resources')}
        >
          <Icon name="work" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-purple-500 w-22 h-22 rounded-full mb-4 shadow-lg items-center justify-center`}
          onPress={handleLocationPress}
        >
          <Icon name="location-on" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-red-500 w-22 h-22 rounded-full mb-4 shadow-lg items-center justify-center`}
          onPress={handlesafetravel}
        >
          <Icon name="emoji-people" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>

    <View style={tw`py-3 px-5 bg-gray-900 items-center`}>
      {isCompleted ? ( 
        <Text style={tw`text-white`}>SOS Message Sent!</Text>
      ) : (
        <SlideButton
          title="Slide to SOS"
          onReachedToEnd={handleSlideComplete} 
          width={300}
          height={60}
          titleColor="white"
          titleFontSize={18}
          buttonBackgroundColor="red"
          buttonTextColor="white"
          buttonBorderRadius={30}
          style={tw`bg-red w-full`}
        />
      )}
      {isCompleted && ( 
        <Text
          style={tw`text-gray-500 mt-2`}
          onPress={() => {
            setIsCompleted(false);
          }}
        >
          Tap to Reset
        </Text>
      )}
    </View>
    <View style={tw`bg-black p-4 items-center`}>
      <Text style={tw`text-white text-sm`}>© 2024 VisionX for Women</Text>
    </View>
  </SafeAreaView>
</GestureHandlerRootView>



  );
};

export default HomePage;
