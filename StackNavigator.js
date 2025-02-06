import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { loadUserData } from './src/redux/userSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { TailwindProvider } from 'tailwind-rn';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import utilities from './tailwind.json';
import { Provider, useDispatch } from 'react-redux';
import { UserProvider, UserContext } from './src/context/UserContext';
import store from './src/redux/store';
import TimerScreen from './src/screens/TimerScreen';

const Stack = createNativeStackNavigator();

const MinSpiritStack = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <UserProvider>
            <TailwindProvider utilities={utilities}>
              <SafeAreaProvider>
                <AppNavigator />
              </SafeAreaProvider>
            </TailwindProvider>
        </UserProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const AppNavigator = () => {
  const { user, setUser } = useContext(UserContext);
  const [initializingMinSpiritApp, setInitializingMinSpiritApp] = useState(true);
  const [onboardVisible, setOnboardVisible] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(loadUserData());
  }, [dispatch]);

  useEffect(() => {
    const loadThisCurUser = async () => {
      try {
        const deviceId = await DeviceInfo.getUniqueId();
        const storageKey = `currentUser_${deviceId}`;
        const storedUser = await AsyncStorage.getItem(storageKey);
        const isOnboardingWasStarted = await AsyncStorage.getItem('isOnboardingWasStarted');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setOnboardVisible(false);
        } else if (isOnboardingWasStarted) {
          setOnboardVisible(false);
        } else {
          setOnboardVisible(true);
          await AsyncStorage.setItem('isOnboardingWasStarted', 'true');
        }
      } catch (error) {
        console.error('Error cur loading of user', error);
      } finally {
        setInitializingMinSpiritApp(false);
      }
    };
    loadThisCurUser();
  }, [setUser]);

  if (initializingMinSpiritApp) {
    return (
      <View style={{
        backgroundColor: '#772374',  
        alignItems: 'center',  
        flex: 1, 
        justifyContent: 'center', 
        }}>
        <ActivityIndicator size="large" color="#1b7368" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={onboardVisible ? 'OnboardingScreen' : 'Timer'}>
        <Stack.Screen name="Timer" component={TimerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} options={{ 
          headerShown: false 
        }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default MinSpiritStack;
