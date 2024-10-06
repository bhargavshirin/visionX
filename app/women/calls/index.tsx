import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc'; 
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { useNavigation } from '@react-navigation/native'; 
import { Audio } from 'expo-av'; 

const contact = {
  name: "Dad",
  phoneNumber: "+91 7989429997",
  imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgNeEa8S9JF336L0E7gD_uGWtGY8GYGFypsw&s", // Placeholder image for contact
};

const IncomingCallScreen: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0); 
  const [rejectPressCount, setRejectPressCount] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null); 
  const navigation = useNavigation(); 
  useEffect(() => {
    const playRingtone = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./ringtone.mp3') 
      );
      setSound(sound);
      await sound.playAsync();
    };

    playRingtone();

    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);
  const handleAcceptCall = async () => {
    console.log("Call accepted");
    setIsCallActive(true);
    if (sound) {
      await sound.stopAsync();
    }
  };
  const handleRejectCall = async () => {
    console.log("Call rejected");
    setIsCallActive(false);
    setCallDuration(0);
    
    if (sound) {
      await sound.stopAsync(); 
    }

    setRejectPressCount(prevCount => prevCount + 1);
    setTimeout(() => {
      setRejectPressCount(0);
    }, 5000);

    if (rejectPressCount === 1) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer); 
  }, [isCallActive]);

  return (
    <View style={tw`flex-1 justify-center items-center bg-black`}>
      <View style={tw`items-center mt-20`}>
        <Image
          source={{ uri: contact.imageUrl }}
          style={tw`w-24 h-24 rounded-full mb-6`}
        />
        <Text style={tw`text-3xl font-semibold text-white`}>{contact.name}</Text>
        <Text style={tw`text-lg text-gray-300`}>{contact.phoneNumber}</Text>
        
        {!isCallActive && (
          <Text style={tw`text-xl text-gray-400 mt-4`}>Incoming Call...</Text>
        )}

        {isCallActive && (
          <Text style={tw`text-xl text-green-500 mt-6`}>
            {`${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
          </Text>
        )}
      </View>

      <View style={tw`absolute bottom-16 w-full flex-row justify-around`}>
        <TouchableOpacity
          style={tw`bg-red-600 w-20 h-20 rounded-full justify-center items-center`}
          onPress={handleRejectCall}
        >
          <Icon name="times" size={30} color="white" style={tw`mb-2`} />
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-green-500 w-20 h-20 rounded-full justify-center items-center`}
          onPress={handleAcceptCall}
        >
          <Icon name="phone" size={30} color="white" style={tw`rotate-45`} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IncomingCallScreen;
