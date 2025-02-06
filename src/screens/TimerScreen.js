import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
  SafeAreaView,
  ImageBackground,
  Modal,
  TextInput,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useNavigation } from '@react-navigation/native';
import MeditationScreen from './MeditationScreen';
import PredictionScreen from './PredictionScreen';
import SettingsScreen from './SettingsScreen';



const fontRobotoBold = 'Roboto-Bold';
const fontRobotoReg = 'Roboto-Regular';
const fontRobotoMonoBold = 'RobotoMono-Bold';


const TimerScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [selectedPage, setSelectedPage] = useState('Timer');
  const navigation = useNavigation();

  const [selectedTimerMode, setSelectedTimerMode] = useState('60 min');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [isSoundEnabled, setSoundEnabled] = useState(true);
  const [isVibrationEnabled, setVibrationEnabled] = useState(true);
  const [isNotificationEnabled, setNotificationEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState('60:00');
  const [isUpTimeChanged, setIsUpTimeChanged] = useState(false);
  const [timerValues, setTimerValues] = useState([40, 60, 90]);
  const [timersList, setTimersList] = useState([]);
  const [currentTimer, setCurrentTimer] = useState(null);
  const [editTimerTitle, setEditTimerTitle] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);


  const [newTimerTitle, setNewTimerTitle] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState('');

  useEffect(() => {
    setCurrentTimer(null)
  }, [selectedTimerMode])


  const handleAddTimer = async () => {
    const minutes = parseInt(newTimerMinutes, 10);
    if (!newTimerTitle || isNaN(minutes) || minutes < 1 || minutes > 180) {
      Alert.alert('Invalid input', 'Please enter a valid title and minutes (1-180).');
      return;
    }

    const maxId = timersList.length > 0 ? Math.max(...timersList.map(timer => timer.id)) : 0;
    const newTimer = { id: maxId + 1, title: newTimerTitle, minutes };
    const updatedTimers = [newTimer, ...timersList];
    setTimersList(updatedTimers);
    await AsyncStorage.setItem('timersList', JSON.stringify(updatedTimers));
    setIsTimerModalVisible(false);
    setIsTimerRunning(true);
    setCurrentTimer(newTimer);
    setTimeLeft(`${newTimer.minutes}:00`);
    setNewTimerTitle('');
    setNewTimerMinutes('');
  };

  const handleMinutesChange = (text) => {
    if (/^\d*$/.test(text) && (text === '' || (parseInt(text, 10) >= 1 && parseInt(text, 10) <= 180))) {
      setNewTimerMinutes(text);
    }
  };

  useEffect(() => {
    const loadTimerValues = async () => {
      try {
        const values = await AsyncStorage.getItem('timerValues');
        if (values !== null) {
          const parsedValues = JSON.parse(values);
          setTimerValues(parsedValues);
          const middleValue = parsedValues[Math.floor(parsedValues.length / 2)];
          setSelectedTimerMode(`${middleValue} min`);
          if (!isTimerRunning) setTimeLeft(`${middleValue}:00`);
        } else {
          const defaultValues = [40, 60, 90];
          setTimerValues(defaultValues);
          const middleValue = defaultValues[Math.floor(defaultValues.length / 2)];
          setSelectedTimerMode(`${middleValue} min`);
          if (!isTimerRunning) setTimeLeft(`${middleValue}:00`);
          await AsyncStorage.setItem('timerValues', JSON.stringify(defaultValues));
        }
      } catch (error) {
        console.error('Error loading timer values:', error);
      }
    };

    loadTimerValues();
  }, [selectedPage]);



  useEffect(() => {
    const loadTimersList = async () => {
      try {
        const values = await AsyncStorage.getItem('timersList');
        if (values !== null) {
          const parsedValues = JSON.parse(values);
          setTimersList(parsedValues);
        } else {
          setTimersList([]);
        }
      } catch (error) {
        console.error('Error loading timer list:', error);
      }
    };

    loadTimersList();
  }, [selectedPage, setTimersList]);


  const deleteTimer = async (timerToDelete) => {
    try {
      const updatedTimers = timersList.filter(timer => timer.id !== timerToDelete.id);
      setTimersList(updatedTimers);
      await AsyncStorage.setItem('timersList', JSON.stringify(updatedTimers));
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

  useEffect(() => {
    console.log('\n\ntimersList:', timersList);
    console.log('timerValues:', timerValues);
  }, [timerValues, timersList]);

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
  }, [])

  useEffect(() => {
    setIsUpTimeChanged(true);
    console.log('isUpTimeChanged:', isUpTimeChanged);
  }, [selectedTimerMode]);


  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const [minutes, seconds] = prevTime.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds - 1;

          if (totalSeconds <= 0) {
            clearInterval(interval);
            setIsTimerRunning(false);
            return '00:00';
          }

          const newMinutes = Math.floor(totalSeconds / 60);
          const newSeconds = totalSeconds % 60;
          if (isVibrationEnabled) {
            ReactNativeHapticFeedback.trigger("impactLight", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
          }
          return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;

        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleEditTimer = async () => {
    const updatedTimers = timersList.map(timer => {
      if (timer.id === currentTimer.id) {
        return { ...timer, title: editTimerTitle };
      }
      return timer;
    });
    setTimersList(updatedTimers);
    await AsyncStorage.setItem('timersList', JSON.stringify(updatedTimers));
    setCurrentTimer(prevTimer => ({ ...prevTimer, title: editTimerTitle }));
    setIsEditModalVisible(false);
  };

  return (
    <ImageBackground
      source={require('../assets/images/backgroundImages/mainBg.png')}
      resizeMode="cover"
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <SafeAreaView style={{
        alignItems: 'center',
        width: dimensions.width,
        position: 'relative',
        flex: 1,
        justifyContent: 'flex-start',

      }} >

        {selectedPage === 'Timer' ? (
          <View style={{ width: '88%', flex: 1, paddingHorizontal: 4 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  borderRadius: dimensions.width * 0.1,
                  width: '100%',
                  alignSelf: 'center',
                  shadowRadius: 3.84,
                  backgroundColor: '#2A1D41',
                  shadowColor: '#000',
                  marginBottom: dimensions.height * 0.01,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,

                }}
              >
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                  {timerValues.map((timerValue) => (
                    <TouchableOpacity
                      key={timerValue}
                      style={{
                        paddingHorizontal: dimensions.width * 0.08,
                        borderRadius: dimensions.width * 0.1,
                        paddingVertical: dimensions.width * 0.04,
                        backgroundColor: selectedTimerMode === `${timerValue} min` ? '#E92BBD' : 'transparent',
                      }}
                      onPress={() => {
                        if (isTimerRunning) {
                          Alert.alert(
                            'Timer is running',
                            'Please stop the timer first',
                            [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                              },
                              {
                                text: 'Stop',
                                onPress: () => {
                                  setIsTimerRunning(false);
                                  setSelectedTimerMode(`${timerValue} min`);
                                  setTimeLeft(`${timerValue}:00`);
                                },
                                style: 'destructive',
                              },
                            ],
                            { cancelable: false }
                          );
                          return;
                        } else {
                          setSelectedTimerMode(`${timerValue} min`);
                          setTimeLeft(`${timerValue}:00`);
                        }
                      }}
                    >
                      <Text
                        style={{ fontFamily: fontRobotoBold, fontSize: dimensions.width * 0.04, color: 'white' }}
                      >
                        {`${timerValue} min`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>



              <View
                style={{
                  width: dimensions.width * 0.7,
                  height: dimensions.width * 0.7,
                  borderRadius: dimensions.width * 0.5,
                  backgroundColor: '#00F2A0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  marginTop: dimensions.height * 0.02,
                  borderColor: '#E92BBD',
                  borderWidth: 4.6,
                }}>

                <Text
                  style={{
                    fontFamily: fontRobotoMonoBold,
                    textAlign: "center",
                    fontSize: dimensions.width * 0.14,
                    fontWeight: 800,
                    color: '#2A1D41',
                    paddingBottom: 8,

                  }}
                >
                  {timeLeft}
                </Text>
              </View>

              <View style={{

                flexDirection: 'row',
                justifyContent: 'space-between',
                maxWidth: '100%',
                alignSelf: 'center',
                marginTop: dimensions.height * 0.02,
              }}>
                <TouchableOpacity
                  onPress={() => {
                    if (currentTimer) {
                      setEditTimerTitle(currentTimer.title);
                      setIsEditModalVisible(true);
                    } else {
                      Alert.alert('No timer selected', 'Please select a timer to edit');
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#2A1D41',
                    borderRadius: dimensions.width * 0.1,
                    maxWidth: '75%',
                    marginRight: '5%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.16,
                    shadowRadius: 3.84,
                  }}>
                  <Text
                    style={{
                      textAlign: "left",
                      fontSize: dimensions.width * 0.046,
                      padding: dimensions.width * 0.04,
                      fontFamily: fontRobotoReg,

                      fontWeight: 400,
                      color: 'white',
                      opacity: 0.7

                    }}
                  >
                    {currentTimer ? `Timer: ${currentTimer.title}` : 'Choose timer'}
                  </Text>
                </TouchableOpacity>



                {!isTimerRunning && (

                  <TouchableOpacity
                    onPress={() => {
                      if (currentTimer) {
                        setEditTimerTitle(currentTimer.title);
                        setIsEditModalVisible(true);
                      } else {
                        Alert.alert('No timer selected', 'Please select a timer to edit');
                      }
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#2A2245',
                      borderRadius: dimensions.width * 0.04,
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxWidth: '20%',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.16,
                      shadowRadius: 3.84,
                    }}>

                    <Image
                      source={require('../assets/icons/penIcon.png')}
                      style={{
                        width: dimensions.width * 0.059,
                        height: dimensions.width * 0.059,
                        top: '0%',
                        textAlign: 'center'
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}


              </View>




              <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '80%',

                alignSelf: 'center',
                marginVertical: dimensions.height * 0.02,
              }}>
                {isTimerRunning && (

                  <TouchableOpacity
                    onPress={() => {
                      setIsTimerRunning(false);
                      setCurrentTimer(null);
                      setSelectedTimerMode(timerValues[Math.floor(timerValues.length / 2)] + ' min');
                      setTimeLeft(`${timerValues[1]}:00`);
                    }}

                    style={{
                      backgroundColor: '#E92BBD',
                      borderRadius: dimensions.width * 0.046,

                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.16,
                      shadowRadius: 3.84,
                      padding: dimensions.width * 0.05,
                    }}>

                    <Image
                      source={require('../assets/icons/reloadIcon.png')}
                      style={{
                        width: dimensions.width * 0.064,
                        height: dimensions.width * 0.064,

                        top: '0%',
                        textAlign: 'center'
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}


                <TouchableOpacity
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                  style={{
                    backgroundColor: '#E92BBD',
                    borderRadius: dimensions.width * 0.046,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: !isTimerRunning ? '40%' : 0,

                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.16,
                    shadowRadius: 3.84,
                    padding: dimensions.width * 0.05,
                  }}>

                  <Image
                    source={!isTimerRunning ? require('../assets/icons/playIcon.png') : require('../assets/icons/pauseIcon.png')}
                    style={{
                      width: dimensions.width * 0.064,
                      height: dimensions.width * 0.064,

                      top: '0%',
                      textAlign: 'center'
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

              </View>

              {!isTimerRunning && (

                <TouchableOpacity
                  onPress={() => { setIsTimerModalVisible(true) }}

                  style={{
                    width: '100%',
                    backgroundColor: '#00F2A0',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    borderRadius: dimensions.width * 0.07,
                    marginVertical: dimensions.height * 0.01,
                    alignItems: 'center',
                  }}>
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
                    Create timer
                  </Text>

                  <Image
                    source={require('../assets/icons/plusIcon.png')}
                    style={{
                      width: dimensions.width * 0.04,
                      height: dimensions.width * 0.04,
                      marginLeft: dimensions.width * 0.01,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}


              <View style={{ marginBottom: dimensions.height * 0.16 }}>

                {timersList.map((timer) => (
                  <TouchableOpacity
                    key={timer.id}
                    onPress={() => {
                      setCurrentTimer(timer);
                      setTimeLeft(`${timer.minutes}:00`);
                      setIsTimerRunning(true);
                    }}
                    onLongPress={() =>
                      Alert.alert(
                        'Delete Timer?',
                        'Are you sure you want to delete this timer?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => deleteTimer(timer), style: 'destructive' },
                        ],
                        { cancelable: true }
                      )
                    }
                    style={{
                      width: '100%',
                      backgroundColor: '#E92BBD',
                      position: 'relative',
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignSelf: 'center',
                      borderRadius: dimensions.width * 0.07,
                      marginTop: dimensions.height * 0.01,
                      alignItems: 'center',
                      paddingHorizontal: dimensions.width * 0.04,
                    }}>

                    <View style={{
                      flex: 1,
                      alignSelf: 'center',
                      paddingVertical: dimensions.width * 0.04,
                    }}>
                      <Text
                        style={{
                          textAlign: "left",
                          fontSize: dimensions.width * 0.04,
                          padding: dimensions.width * 0.01,
                          fontFamily: fontRobotoReg,
                          fontWeight: 500,
                          color: 'white',
                        }}
                      >
                        {timer.title}
                      </Text>
                      <Text
                        style={{
                          textAlign: "left",
                          fontSize: dimensions.width * 0.04,
                          padding: dimensions.width * 0.01,
                          fontFamily: fontRobotoReg,
                          fontWeight: 500,
                          color: 'white',
                        }}
                      >
                        {timer.minutes} min
                      </Text>
                    </View>

                    <Image
                      source={require('../assets/icons/playIcon.png')}
                      style={{
                        width: dimensions.width * 0.064,
                        height: dimensions.width * 0.064,
                        textAlign: 'center'
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            <View style={{ position: 'absolute', bottom: '14%', left: '50%', backgroundColor: '#3179AC' }}>

            </View>
          </View>

        ) : selectedPage === 'Settings' ? (
          <SettingsScreen isSoundEnabled={isSoundEnabled} isVibrationEnabled={isVibrationEnabled}
            setSoundEnabled={setSoundEnabled} setVibrationEnabled={setVibrationEnabled}
            isNotificationEnabled={isNotificationEnabled} setNotificationEnabled={setNotificationEnabled}
          />
        ) : selectedPage === 'Prediction' ? (
          <PredictionScreen selectedPage={selectedPage} />
        ) : selectedPage === 'Meditation' ? (
          <MeditationScreen setSelectedPage={setSelectedPage} selectedPage={selectedPage} />
        ) : null}


        <View
          style={{
            position: 'absolute',
            bottom: '3%',
            backgroundColor: '#2A1D41',
            width: '100%,',
            paddingHorizontal: dimensions.width * 0.03,
            borderRadius: dimensions.width * 0.1,
            borderWidth: 1.9,
            borderColor: '#7f2377',
            height: '8%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            paddingVertical: dimensions.height * 0.03,
          }}
        >

          <TouchableOpacity
            onPress={() => setSelectedPage('Prediction')}
            style={{
              borderRadius: '50%',
              paddingVertical: dimensions.width * 0.03,
              paddingHorizontal: dimensions.width * 0.0,

              alignItems: 'center',
            }}
          >
            <Image
              source={selectedPage === 'Prediction' ? require('../assets/icons/pickedIcons/selectedPredictionIcon.png') : require('../assets/icons/mainScreensIcons/predictionIcon.png')}
              style={{
                width: dimensions.width * 0.19,
                height: dimensions.width * 0.19,
                textAlign: 'center'
              }}
              resizeMode="contain"
            />
            {/* <Text style={{color: 'white', fontSize: dimensions.width * 0.03}}>Prediction</Text> */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPage('Timer')}
            style={{
              borderRadius: '50%',
              paddingVertical: dimensions.width * 0.03,
              paddingHorizontal: dimensions.width * 0.0,

              alignItems: 'center',
              marginLeft: 5,
            }}
          >
            <Image
              source={selectedPage === 'Timer' ? require('../assets/icons/pickedIcons/selectedTimerIcon.png') : require('../assets/icons/mainScreensIcons/timerIcon.png')}
              style={{
                width: dimensions.width * 0.19,
                height: dimensions.width * 0.19,
                textAlign: 'center'
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>



          <TouchableOpacity
            onPress={() => setSelectedPage('Meditation')}
            style={{
              alignItems: 'center',
              borderRadius: '50%',
              paddingVertical: dimensions.width * 0.03,
              paddingHorizontal: dimensions.width * 0.0,
              marginHorizontal: 5,
            }}
          >
            <Image
              source={selectedPage === 'Meditation' ? require('../assets/icons/pickedIcons/selectedMeditationIcon.png') : require('../assets/icons/mainScreensIcons/meditationIcon.png')}
              style={{
                width: dimensions.width * 0.19,
                height: dimensions.width * 0.19,
                textAlign: 'center'
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => setSelectedPage('Settings')}
            style={{
              alignItems: 'center',
              paddingVertical: dimensions.width * 0.03,
              paddingHorizontal: dimensions.width * 0.0,
              borderRadius: '50%',
              marginRight: 5,
            }}
          >
            <Image
              source={selectedPage === 'Settings' ? require('../assets/icons/pickedIcons/selectedSettingsIcon.png') : require('../assets/icons/mainScreensIcons/settingsIcon.png')}
              style={{
                width: dimensions.width * 0.19,
                height: dimensions.width * 0.19,
                textAlign: 'center'
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>



        <Modal
          visible={isTimerModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsTimerModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '100%',
            height: '100%',
          }}>
            <View style={{ backgroundColor: '#2A1D41', width: '90%', height: '34%', alignSelf: 'center', borderRadius: dimensions.width * 0.1, padding: 20 }}>
              <View style={{ display: 'flex', width: '100%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{
                  paddingBottom: 5,
                  fontFamily: fontRobotoBold,
                  fontWeight: 700,
                  textAlign: 'left',
                  fontSize: dimensions.width * 0.05,
                  color: 'white',
                }}>
                  Set timer
                </Text>
                <TouchableOpacity onPress={() => setIsTimerModalVisible(false)}>
                  <Image
                    source={require('../assets/icons/closeIcon.png')}
                    style={{
                      width: dimensions.width * 0.07,
                      height: dimensions.width * 0.07,
                      top: '0%',
                      textAlign: 'center'
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#948ea0',
                  borderRadius: dimensions.width * 0.07,
                  marginTop: dimensions.height * 0.01,
                  paddingHorizontal: dimensions.width * 0.04,
                  color: 'white',
                  fontSize: dimensions.width * 0.044,
                  fontFamily: fontRobotoReg,
                  paddingVertical: dimensions.height * 0.014,
                }}
                placeholder="Set title"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={newTimerTitle}
                onChangeText={setNewTimerTitle}
              />
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#948ea0',
                  borderRadius: dimensions.width * 0.07,
                  marginTop: dimensions.height * 0.008,
                  paddingHorizontal: dimensions.width * 0.04,
                  color: 'white',
                  fontSize: dimensions.width * 0.044,
                  fontFamily: fontRobotoReg,
                  paddingVertical: dimensions.height * 0.014,
                }}
                placeholder="Set minutes"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                keyboardType="numeric"
                value={newTimerMinutes}
                onChangeText={handleMinutesChange}
              />
              <TouchableOpacity
                style={{
                  width: '100%',
                  backgroundColor: '#E92BBD',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderRadius: dimensions.width * 0.07,
                  marginTop: dimensions.height * 0.025,
                  alignItems: 'center',
                  paddingHorizontal: dimensions.width * 0.04,
                }}
                onPress={handleAddTimer}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: dimensions.width * 0.044,
                    padding: dimensions.width * 0.01,
                    fontFamily: fontRobotoReg,
                    fontWeight: 500,
                    color: 'white',
                    marginRight: dimensions.width * 0.02,
                    paddingVertical: dimensions.height * 0.014,
                  }}
                >
                  Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '100%',
            height: '100%',
          }}>
            <View style={{ backgroundColor: '#2A1D41', width: '90%', height: '34%', alignSelf: 'center', borderRadius: dimensions.width * 0.1, padding: 20 }}>
              <View style={{ display: 'flex', width: '100%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{
                  paddingBottom: 5,
                  fontFamily: fontRobotoBold,
                  fontWeight: 700,
                  textAlign: 'left',
                  fontSize: dimensions.width * 0.05,
                  color: 'white',
                }}>
                  Edit timer
                </Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Image
                    source={require('../assets/icons/closeIcon.png')}
                    style={{
                      width: dimensions.width * 0.07,
                      height: dimensions.width * 0.07,
                      top: '0%',
                      textAlign: 'center'
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#948ea0',
                  borderRadius: dimensions.width * 0.07,
                  marginTop: dimensions.height * 0.01,
                  paddingHorizontal: dimensions.width * 0.04,
                  color: 'white',
                  fontSize: dimensions.width * 0.044,
                  fontFamily: fontRobotoReg,
                  paddingVertical: dimensions.height * 0.014,
                }}
                placeholder="Edit title"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={editTimerTitle}
                onChangeText={setEditTimerTitle}
              />
              <TouchableOpacity
                style={{
                  width: '100%',
                  backgroundColor: '#E92BBD',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderRadius: dimensions.width * 0.07,
                  marginTop: dimensions.height * 0.025,
                  alignItems: 'center',
                  paddingHorizontal: dimensions.width * 0.04,
                }}
                onPress={handleEditTimer}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: dimensions.width * 0.044,
                    padding: dimensions.width * 0.01,
                    fontFamily: fontRobotoReg,
                    fontWeight: 500,
                    color: 'white',
                    marginRight: dimensions.width * 0.02,
                    paddingVertical: dimensions.height * 0.014,
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>

    </ImageBackground>
  );
};

export default TimerScreen;
