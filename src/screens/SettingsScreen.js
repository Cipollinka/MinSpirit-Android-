import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  ScrollView,
  Alert,
  SafeAreaView,
  ImageBackground,
  Modal,
  Switch,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/solid';

const fontRobotoBold = 'Roboto-Bold';
const fontRobotoReg = 'Roboto-Regular';

const SettingsScreen = ({ isSoundEnabled, setSoundEnabled, isVibrationEnabled, setVibrationEnabled, isNotificationEnabled, setNotificationEnabled }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isChangeTimerTabsVisible, setIsChangeTimerTabsVisible] = useState(false);
  const [timerValues, setTimerValues] = useState([40, 60, 90]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [newValue, setNewValue] = useState('');

  const shareText = async () => {
    try {
      await Share.share({
        message: `Join MinSpirit: Countdown of Time!\n`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const soundValue = await AsyncStorage.getItem('isSoundEnabled');
      const vibrationValue = await AsyncStorage.getItem('isVibrationEnabled');
      const notificationValue = await AsyncStorage.getItem('isNotificationEnabled');

      if (soundValue !== null) setSoundEnabled(JSON.parse(soundValue));
      if (vibrationValue !== null) setVibrationEnabled(JSON.parse(vibrationValue));
      if (notificationValue !== null) setNotificationEnabled(JSON.parse(notificationValue));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  useEffect(() => {
    loadSettings();
    const loadTimerValues = async () => {
      try {
        const values = await AsyncStorage.getItem('timerValues');
        if (values !== null) {
          setTimerValues(JSON.parse(values));
        }
      } catch (error) {
        console.error('Error loading timer values:', error);
      }
    };

    loadTimerValues();
  }, []);

  const toggleSoundSwitch = () => {
    const newValue = !isSoundEnabled;
    setSoundEnabled(newValue);
    saveSettings('isSoundEnabled', newValue);
  };

  const toggleVibrationSwitch = () => {
    const newValue = !isVibrationEnabled;
    setVibrationEnabled(newValue);
    saveSettings('isVibrationEnabled', newValue);
  };

  const toggleNotificationSwitch = () => {
    const newValue = !isNotificationEnabled;
    setNotificationEnabled(newValue);
    saveSettings('isNotificationEnabled', newValue);
  };

  const saveTimerValues = async (values) => {
    try {
      await AsyncStorage.setItem('timerValues', JSON.stringify(values));
      setTimerValues(values);
    } catch (error) {
      console.error('Error saving timer values:', error);
    }
  };

  const handleTimerValueChange = (index) => {
    setCurrentIndex(index);
    setNewValue(timerValues[index].toString());
    setIsModalVisible(true);
  };


  const handleMinutesChange = (text) => {
    if (/^\d*$/.test(text) && (text === '' || (parseInt(text, 10) >= 1 && parseInt(text, 10) <= 180))) {
      setNewValue(text);
    }
  };

  const handleSaveNewValue = () => {
    const intValue = parseInt(newValue, 10);
    if (intValue >= 1 && intValue <= 180) {
      const newValues = [...timerValues];
      newValues[currentIndex] = intValue;
      saveTimerValues(newValues);
      setIsModalVisible(false);
    } else {
      Alert.alert('Invalid value', 'Please enter a value between 1 and 180.');
    }
  };

  return (
    <SafeAreaView style={{
      width: dimensions.width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    }} >
      <View style={{ width: '88%', paddingHorizontal: 4 }}>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            borderRadius: dimensions.width * 0.1,
            backgroundColor: '#FBB87A',
            marginBottom: dimensions.height * 0.01,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}  >
            <View
              style={{
                borderRadius: dimensions.width * 0.1,
                paddingVertical: dimensions.width * 0.04,
                paddingHorizontal: dimensions.width * 0.08,
              }}
            >
              <Text
                style={{ fontFamily: fontRobotoBold, fontSize: dimensions.width * 0.04, color: 'white', textAlign: 'center', }}
              >
                Settings
              </Text>
            </View>
          </View>
        </View>
      </View>


      {!isChangeTimerTabsVisible ? (

        <View style={{
          width: '90%',
          marginTop: dimensions.width * 0.04,
          borderRadius: 25,
          backgroundColor: '#2A1D41',
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 3.84,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            borderBottomColor: '#c5c5c6',
            borderBottomWidth: 0.4,
            borderRadius: 8,
          }}>
            <Text style={{
              color: 'white',
              fontSize: dimensions.width * 0.05,
              fontFamily: fontRobotoReg,
            }}>Vibration</Text>
            <Switch
              trackColor={{ false: '#948ea0', true: '#E92BBD' }}
              thumbColor={isVibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#3E3E3E"
              onValueChange={toggleVibrationSwitch}
              value={isVibrationEnabled}
            />
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            borderBottomColor: '#c5c5c6',
            borderBottomWidth: 0.4,
            borderRadius: 8,
          }}>
            <Text style={{
              color: 'white',
              fontSize: dimensions.width * 0.05,
              fontFamily: fontRobotoReg,
            }}>Notifications</Text>
            <Switch
              trackColor={{ false: '#948ea0', true: '#E92BBD' }}
              thumbColor={isNotificationEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#3E3E3E"
              onValueChange={toggleNotificationSwitch}
              value={isNotificationEnabled}
            />
          </View>

          <TouchableOpacity onPress={() => setIsChangeTimerTabsVisible(true)}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              borderBottomColor: '#c5c5c6',
              borderBottomWidth: 0.4,
              borderRadius: 8,
            }}>
              <Text style={{
                color: 'white',
                fontSize: dimensions.width * 0.05,
                fontFamily: fontRobotoReg,
              }}>Change timer tabs</Text>
              <ChevronRightIcon size={25} color='white' />
            </View>
          </TouchableOpacity>




          <TouchableOpacity onPress={shareText} style={{


            borderRadius: 8,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              borderBottomColor: '#c5c5c6',

              borderRadius: 8,
            }}>

              <Text style={{
                color: 'white',
                fontSize: dimensions.width * 0.05,
                fontFamily: fontRobotoReg,
              }}>Share the app</Text>


              <Image
                source={require('../assets/icons/shareIconSetts.png')}
                style={{
                  width: dimensions.width * 0.059,
                  height: dimensions.width * 0.059,
                  top: '0%',
                  textAlign: 'center'
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{
          width: '90%',
          marginTop: dimensions.width * 0.04,
          borderRadius: 25,
          backgroundColor: '#2A1D41',
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 3.84,
        }}>
          <TouchableOpacity
            onPress={() => setIsChangeTimerTabsVisible(false)}
            style={{
              flexDirection: 'row',

              alignItems: 'center',

            }}>
            <ChevronLeftIcon size={25} color='white' />
            <Text style={{
              color: 'white',
              fontSize: dimensions.width * 0.046,
              fontFamily: fontRobotoReg,
              marginLeft: 10
            }}>back</Text>

          </TouchableOpacity>
          <Text style={{
            color: 'white',
            fontSize: dimensions.width * 0.046,
            fontFamily: fontRobotoReg,
            marginLeft: 10,
            marginTop: dimensions.height * 0.02
          }}>Customize your timers to suit your routine! Set the duration of reminders by entering the number of minutes</Text>


          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: dimensions.height * 0.02,
              marginBottom: dimensions.height * 0.04
            }}  >
            {timerValues.map((timerValue, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  borderRadius: dimensions.width * 0.1,
                  paddingVertical: dimensions.width * 0.025,
                  paddingHorizontal: dimensions.width * 0.07,
                  backgroundColor: '#948ea0',
                }}
                onPress={() => handleTimerValueChange(index)}
              >
                <Text
                  style={{
                    fontFamily: fontRobotoReg,
                    fontSize: dimensions.width * 0.035,
                    color: 'white'
                  }}
                >
                  {`${timerValue} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


          <TouchableOpacity
            style={{
              width: '70%',
              backgroundColor: '#00F2A0',
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: dimensions.width * 0.07,
              marginTop: dimensions.height * 0.025,
              alignItems: 'center',
              paddingHorizontal: dimensions.width * 0.04,
            }}
            onPress={() => {saveTimerValues(timerValues); setIsChangeTimerTabsVisible(false)}}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: dimensions.width * 0.044,
                padding: dimensions.width * 0.01,
                fontFamily: fontRobotoReg,
                fontWeight: 500,
                color: '#2A1D41',
                marginRight: dimensions.width * 0.02,
                paddingVertical: dimensions.height * 0.014,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <View style={{
                width: '80%',
                backgroundColor: '#2A1D41',
                borderRadius: 10,
                padding: 20,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: dimensions.width * 0.05,
                  fontFamily: fontRobotoReg,
                  marginBottom: 10,
                  color: 'white',
                }}>Enter new value (1-180):</Text>
                <TextInput
                  style={{
                    width: '100%',
                    borderColor: 'gray',
                    borderWidth: 1,
                    borderRadius: 5,
                    padding: 10,
                    marginBottom: 20,
                    textAlign: 'center',
                    color: 'white',
                  }}
                  keyboardType="numeric"
                  value={newValue}
                  onChangeText={handleMinutesChange}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#00F2A0',
                    padding: 10,
                    borderRadius: dimensions.width * 0.07,
                    width: '70%',
                    alignItems: 'center',
                  }}
                  onPress={handleSaveNewValue}
                >
                  <Text style={{
                    color: '#2A1D41',
                    fontFamily: fontRobotoBold,
                    fontSize: dimensions.width * 0.041,
                    fontWeight: 'bold',
                  }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>



      )}
    </SafeAreaView>
  );
};

export default SettingsScreen;
