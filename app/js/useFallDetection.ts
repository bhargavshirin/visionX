import { useState, useEffect } from 'react';
import { Accelerometer, Gyroscope, ThreeAxisMeasurement, Subscription } from 'expo-sensors';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

const ACCELERATION_THRESHOLD = 10;
const FALL_INACTIVITY_TIME = 200;

export const useFallDetection = () => {
  const [fallDetected, setFallDetected] = useState<boolean>(false);

  useEffect(() => {
    let accelSubscription: Subscription | null = null;
    let gyroSubscription: Subscription | null = null;

    Accelerometer.setUpdateInterval(100);
    accelSubscription = Accelerometer.addListener((data: ThreeAxisMeasurement) => {
      const { x, y, z } = data;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

      if (totalAcceleration > ACCELERATION_THRESHOLD) {
        setFallDetected(true);
        setTimeout(() => setFallDetected(false), FALL_INACTIVITY_TIME);
      }
    });

    Gyroscope.setUpdateInterval(100);
    gyroSubscription = Gyroscope.addListener((data: ThreeAxisMeasurement) => {
    });

    return () => {
      accelSubscription && accelSubscription.remove();
      gyroSubscription && gyroSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const handleFallDetected = async () => {
      if (fallDetected) {
        Alert.alert('Fall Detected', 'A strong movement was detected, possibly indicating a fall.');
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = coords;
          const googleMapsLink = `https://www.google.com/maps/@${latitude},${longitude},15z`;
          const response = await fetch('https://visionxserver.vercel.app/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: `Fall is detected. Please check the user. Detected Location - Latitude: ${latitude}, Longitude: ${longitude}. Map Link: ${googleMapsLink}`,
            }),
          });

          const responseJson = await response.json();
          if (response.ok) {
            console.log(`Success: ${responseJson.message}`);
          } else {
            console.error(`Failed: ${responseJson.message}`);
          }

          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          console.log(`Google Maps Link: ${googleMapsLink}`);
        } catch (error) {
          console.error('Error:', error);
        }     
      }
    };

    handleFallDetected(); 
  }, [fallDetected]);
};
