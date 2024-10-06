import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native'; 
import { router } from 'expo-router';

const resources = [
  {
    title: 'Financial Independence for Women',
    description: 'Learn the basics of budgeting, saving, and investing tailored to women’s financial needs.',
  },
  {
    title: 'Investment Strategies',
    description: 'Understand how to grow wealth through smart investments with low risk and high returns.',
  },
  {
    title: 'Building a Financial Safety Net',
    description: 'Learn how to secure yourself with emergency funds, insurance, and debt management.',
  },
  {
    title: 'Retirement Planning',
    description: 'Discover the importance of early retirement planning and how to maximize retirement savings.',
  },
  {
    title: 'Entrepreneurship & Financial Growth',
    description: 'Learn how to start and grow a business with financial literacy tips that target women entrepreneurs.',
  },
];

const FinancialKnowledgeScreen: React.FC = () => {
  const navigation = useNavigation(); 

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <SafeAreaView style={tw`flex-1 bg-gray-100`}> 
      <View style={tw`bg-black p-4 pt-14`}>
            <Text style={tw`text-white text-2xl font-bold text-center`}>VisionX</Text>
          </View>
        
        <View style={tw`bg-purple-800 py-6 px-6 flex-row items-center justify-between shadow-md`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-2xl font-bold text-white`}>Financial Literacy</Text>
          <View style={tw`w-6`}/> 
        </View>

        <ScrollView style={tw`px-4 py-6`}>
          <View style={tw`flex items-center mb-6`}>
            <Text style={tw`text-3xl font-bold text-purple-800`}>Empower Your Financial Journey</Text>
            <Text style={tw`text-lg text-gray-600 mt-2 text-center`}>
              Resources and tips to improve financial knowledge for women.
            </Text>
          </View>
          <View style={tw`space-y-6 `}>
            {resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={tw`mb-1 bg-white rounded-lg p-4 shadow-md`}
              >
                <Text style={tw`text-xl font-semibold text-blue-900`}>{resource.title}</Text>
                <Text style={tw`text-gray-600 mt-2 `}>{resource.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={tw`mt-10 flex items-center`}>
            <TouchableOpacity
              style={tw`bg-purple-700 rounded-full py-3 px-6 shadow-md`}
                onPress={() => router.push('https://zerodha.com/varsity/module/personalfinance/')}
            >
              <Text style={tw`text-white text-lg font-semibold`}>Explore More Resources</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={tw`bg-gray-200 py-4 px-6 flex items-center`}>
          <Text style={tw`text-gray-600 text-sm`}>
            VisionX © 2024
          </Text>
          <Text style={tw`text-gray-500 text-sm mt-1`}>
            Helping women achieve financial freedom and confidence.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default FinancialKnowledgeScreen;
