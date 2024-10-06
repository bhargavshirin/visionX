import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc'; 
import { StatusBar } from 'expo-status-bar'; 
import { useNavigation } from '@react-navigation/native'; 
import { ref, set, onValue } from 'firebase/database'; 
import { fdb } from '../../firebase/config'; 
import * as Location from 'expo-location'; 
import { MaterialIcons } from '@expo/vector-icons'; 

const ChatPage: React.FC = () => {
  const navigation = useNavigation(); 
  const [message, setMessage] = useState<string>(''); 
  const [messages, setMessages] = useState<{ text: string; sender: string; time: string }[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const messagesRef = ref(fdb, 'messages'); 
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.values(data) : [];
      const formattedMessages = loadedMessages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        time: msg.time
      }));

      setMessages(formattedMessages);
      flatListRef.current?.scrollToEnd({ animated: true });
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });
    
    return () => {
      unsubscribe(); 
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) { 
      const newMessage = {
        text: message,
        sender: 'You',  
        time: new Date().toLocaleTimeString()
      };
      const newMessageRef = ref(fdb, `messages/${Date.now()}`); 
      set(newMessageRef, newMessage) 
        .then(() => {
          setMessage(''); 
        })
        .catch((error) => {
          console.error("Error sending message: ", error);
        });
    }
  };

  const handleShareLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const locationMessage = `Here is my location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const newMessage = {
      text: locationMessage,
      sender: 'You',
      time: new Date().toLocaleTimeString(),
    };
    const newMessageRef = ref(fdb, `messages/${Date.now()}`);
    set(newMessageRef, newMessage)
      .then(() => {
        console.log('Location sent successfully!');
      })
      .catch((error) => {
        console.error('Error sending location: ', error);
      });
  };

  const renderMessage = ({ item }: { item: { text: string; sender: string; time: string } }) => (
    <View style={tw`flex-row ${item.sender === 'You' ? 'justify-end' : 'justify-start'} mb-2`}>
      <View style={[
        tw`p-3 rounded-3xl w-[75%]`, 
        item.sender === 'You' ? tw`bg-blue-600 shadow-md` : tw`bg-gray-300 shadow-sm`
      ]}>
        <Text style={tw`${item.sender === 'You' ? 'text-white' : 'text-black'} font-semibold`}>{item.text}</Text>
        <Text style={tw`text-xs ${item.sender === 'You' ? 'text-gray-200' : 'text-gray-500'} mt-1`}>{item.time}</Text>
      </View>
    </View>
  );
  

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <StatusBar style="dark" /> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`flex-1 p-4`}>
          <View style={tw`flex-row items-center mb-4 pt-6 border-b border-gray-300 pb-2`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
              <Text style={tw`text-blue-500 font-bold`}>Back</Text>
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold ml-4`}>Chat</Text>
          </View>

          {loading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-20`} 
              showsVerticalScrollIndicator={false}
              ref={flatListRef}
            />
          )}

          <View style={tw`flex-row items-center mt-4`}>
            <TextInput
              style={tw`flex-1 border border-gray-300 rounded-lg p-3 bg-white shadow-md`}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={1}
            />
            <TouchableOpacity
              style={tw`bg-blue-600 p-3 rounded-lg ml-2`}
              onPress={handleSend}
            >
              <Text style={tw`text-white font-bold`}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareLocation} style={tw`bg-gray-200 p-3 rounded-lg ml-2`}>
              <MaterialIcons name="location-on" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatPage;
