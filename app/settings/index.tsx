import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { db } from '../firebase/config'; 
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import * as Device from 'expo-device';

const SettingsPage = () => {
  const navigation = useNavigation();

  const [emergencyNumber1, setEmergencyNumber1] = useState<string>('');
  const [emergencyNumber2, setEmergencyNumber2] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isAnotherToggleEnabled, setIsAnotherToggleEnabled] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false); // New state for save status

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const toggleAnotherSwitch = () => setIsAnotherToggleEnabled(previousState => !previousState);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(collection(db, 'settings'), 'settings'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setEmergencyNumber1(data.emergencyNumber1 || '');
          setEmergencyNumber2(data.emergencyNumber2 || '');
          setEmail(data.email || '');
          setIsEnabled(data.notificationsEnabled || false);
          setIsAnotherToggleEnabled(data.locationServicesEnabled || false);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchDeviceId = () => {
      if (Device.isDevice) {
        const id = Device.deviceId; 
        setDeviceId(id);
      } else {
        setDeviceId('This is a simulator or emulator');
        console.log('This is not a physical device');
      }
    };

    fetchSettings();
    fetchDeviceId();
  }, []);

  const handleSave = async () => {
    try {
      const settingsData = {
        emergencyNumber1,
        emergencyNumber2,
        email,
        notificationsEnabled: isEnabled,
        locationServicesEnabled: isAnotherToggleEnabled,
      };
      await setDoc(doc(collection(db, 'settings'), 'settings'), settingsData);
      console.log('Settings saved successfully:', settingsData);
      setIsSaved(true); 
      Alert.alert("Settings saved!", "Your settings have been successfully updated."); 
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert("Error", "There was an error saving your settings."); 
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`bg-black py-2 px-4 flex-row items-center justify-between`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
          <Text style={tw`text-white text-lg mt-6`}>← Back</Text>
        </TouchableOpacity>
        <Text style={tw`text-white text-lg font-bold mt-6`}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={tw`p-5 bg-gray-100`}>
        {isSaved && (
          <View style={tw`bg-green-200 p-3 rounded mb-4`}>
            <Text style={tw`text-green-800 text-center`}>Settings have been saved!</Text>
          </View>
        )}
        <Text style={tw`text-black text-lg mb-2`}>Emergency Number 1</Text>
        <TextInput
          style={tw`h-12 border border-gray-300 rounded-lg p-2 text-black bg-white`}
          placeholder="Enter emergency number 1"
          keyboardType="phone-pad"
          value={emergencyNumber1}
          onChangeText={setEmergencyNumber1}
        />
        
        <Text style={tw`text-black text-lg mt-4 mb-2`}>Emergency Number 2</Text>
        <TextInput
          style={tw`h-12 border border-gray-300 rounded-lg p-2 text-black bg-white`}
          placeholder="Enter emergency number 2"
          keyboardType="phone-pad"
          value={emergencyNumber2}
          onChangeText={setEmergencyNumber2}
        />
        <Text style={tw`text-black text-lg mt-4 mb-2`}>Email</Text>
        <TextInput
          style={tw`h-12 border border-gray-300 rounded-lg p-2 text-black bg-white`}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={tw`flex-row justify-between items-center mt-6 mb-6`}>
          <Text style={tw`text-black text-lg`}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <Text style={tw`text-black text-lg`}>Enable Location Services</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isAnotherToggleEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleAnotherSwitch}
            value={isAnotherToggleEnabled}
          />
        </View>
        <TouchableOpacity
          style={tw`rounded-full bg-red-400 p-4 items-center mt-4`}
          onPress={handleSave}
        >
          <Text style={tw`text-white text-lg`}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={tw`bg-black p-5 items-center`}>
        <Text style={tw`text-white text-sm`}>© 2024 VisionX</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsPage;
