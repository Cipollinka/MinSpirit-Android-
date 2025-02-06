import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  TextInput,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const fontRobotoBold = 'Roboto-Bold';
const fontRobotoReg = 'Roboto-Regular';
const fontRobotoMonoBold = 'RobotoMono-Bold';


const MeditationScreen = ({ selectedPage, setSelectedPage }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const [isMeditationRunning, setIsMeditationRunning] = useState(false);
  const [isMeditationModalVisible, setIsMeditationModalVisible] = useState(false);
  const [meditationsList, setMeditationsList] = useState([]);
  const [newMeditationMinutes, setNewMeditationMinutes] = useState('');
  const [currentMeditation, setCurrentMeditation] = useState(null);
  const [timeLeft, setTimeLeft] = useState('10:00');


  const handleAddMeditation = async () => {
    const minutes = parseInt(newMeditationMinutes, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 180) {
      Alert.alert('Invalid input', 'Please enter a valid minutes (1-180).');
      return;
    }

    const maxId = meditationsList.length > 0 ? Math.max(...meditationsList.map(meditation => meditation.id)) : 0;
    const newMeditation = { id: maxId + 1, minutes };
    const updatedMeditations = [newMeditation, ...meditationsList];
    setMeditationsList(updatedMeditations);
    await AsyncStorage.setItem('meditationsList', JSON.stringify(updatedMeditations));
    setIsMeditationModalVisible(false);
    setIsMeditationRunning(true);
    setCurrentMeditation(newMeditation);
    setTimeLeft(`${newMeditation.minutes}:00`);
    setNewMeditationMinutes('');
  };


  const handleMinutesChange = (text) => {
    if (/^\d*$/.test(text) && (text === '' || (parseInt(text, 10) >= 1 && parseInt(text, 10) <= 180))) {
      setNewMeditationMinutes(text);
    }
  };

  useEffect(() => {
    const loadMeditationsList = async () => {
      try {
        const values = await AsyncStorage.getItem('meditationsList');
        if (values !== null) {
          const parsedValues = JSON.parse(values);
          setMeditationsList(parsedValues);
        } else {
          setMeditationsList([]);
        }
      } catch (error) {
        console.error('Error loading meditation list:', error);
      }
    };

    loadMeditationsList();
  }, [selectedPage, setMeditationsList]);


  const deleteMeditation = async (meditationToDelete) => {
    try {
      const updatedMeditations = meditationsList.filter(meditation => meditation.id !== meditationToDelete.id);
      setMeditationsList(updatedMeditations);
      await AsyncStorage.setItem('meditationsList', JSON.stringify(updatedMeditations));
    } catch (error) {
      console.error('Error deleting meditation:', error);
    }
  };


  useEffect(() => {
    let interval;
    if (isMeditationRunning) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const [minutes, seconds] = prevTime.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds - 1;

          if (totalSeconds <= 0) {
            clearInterval(interval);
            setIsMeditationRunning(false);
            return '00:00';
          }

          const newMinutes = Math.floor(totalSeconds / 60);
          const newSeconds = totalSeconds % 60;
          return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isMeditationRunning, timeLeft]);

  return (
    <SafeAreaView style={{
      width: dimensions.width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    }} >
      <View style={{ width: '88%', flex: 1, paddingHorizontal: 4 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
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
                  Meditation
                </Text>
              </View>

            </View>
          </View>



          <View
            style={{
              width: dimensions.width * 0.7,
              height: dimensions.width * 0.7,
              borderRadius: dimensions.width * 0.5,
              backgroundColor: '#E92BBD',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: dimensions.height * 0.02,
              borderColor: '#00F2A0',
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
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '80%',

            alignSelf: 'center',
            marginVertical: dimensions.height * 0.02,
          }}>
            {isMeditationRunning && (

              <TouchableOpacity
                onPress={() => {
                  setIsMeditationRunning(false);
                  setCurrentMeditation(null);
                  setTimeLeft(`10:00`);
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
              onPress={() => setIsMeditationRunning(!isMeditationRunning)}
              style={{
                backgroundColor: '#E92BBD',
                borderRadius: dimensions.width * 0.046,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: !isMeditationRunning ? '40%' : 0,

                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.16,
                shadowRadius: 3.84,
                padding: dimensions.width * 0.05,
              }}>

              <Image
                source={!isMeditationRunning ? require('../assets/icons/playIcon.png') : require('../assets/icons/pauseIcon.png')}
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

          {!isMeditationRunning && (

            <TouchableOpacity
              onPress={() => { setIsMeditationModalVisible(true) }}

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
                Set meditation
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
            {meditationsList.map(meditation => (

              <TouchableOpacity
                onPress={() => {
                  setCurrentMeditation(meditation);
                  setTimeLeft(`${meditation.minutes}:00`);
                  setIsMeditationRunning(true);
                }}
                onLongPress={() =>
                  Alert.alert(
                    'Delete meditation?',
                    'Are you sure you want to delete this meditation?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => deleteMeditation(meditation), style: 'destructive' },
                    ],
                    { cancelable: true }
                  )
                }
                key={meditation.id}
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
                    {meditation.minutes} min
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

      <Modal
        visible={isMeditationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMeditationModalVisible(false)}
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
                Set meditation
              </Text>
              <TouchableOpacity onPress={() => setIsMeditationModalVisible(false)}>
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
              value={newMeditationMinutes}
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
              onPress={handleAddMeditation}
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
    </SafeAreaView>
  );
};

export default MeditationScreen;
