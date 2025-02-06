import AsyncStorage from '@react-native-async-storage/async-storage';
import { is } from 'date-fns/locale';
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

} from 'react-native';


const predictions = [
  {
    id: 1,
    predictionDescription: 'A small shift today will lead to great change tomorrow.',
  },
  {
    id: 2,
    predictionDescription: 'Patience is your silent ally — trust the process.',
  },
  {
    id: 3,
    predictionDescription: 'Embrace the unknown; it holds the key to growth.',
  },
  {
    id: 4,
    predictionDescription: 'Today, let go of what no longer serves you.',
  },
  {
    id: 5,
    predictionDescription: 'Your energy will attract what you focus on — choose wisely.',
  },
  {
    id: 6,
    predictionDescription: 'A quiet mind reveals loud answers.',
  },
  {
    id: 7,
    predictionDescription: 'Someone unexpected will bring you clarity.',
  },
  {
    id: 8,
    predictionDescription: 'The answers you seek are already within you.',
  },
  {
    id: 9,
    predictionDescription: 'Your path is unfolding exactly as it should.',
  },
  {
    id: 10,
    predictionDescription: 'Breathe deeply; solutions arise when you pause.',
  },
  {
    id: 11,
    predictionDescription: 'Luck favors the calm and patient heart.',
  },
  {
    id: 12,
    predictionDescription: 'Opportunities will appear disguised as challenges.',
  },
  {
    id: 13,
    predictionDescription: 'Trust your intuition; it knows the way forward.',
  },
  {
    id: 14,
    predictionDescription: 'Small steps lead to powerful destinations.',
  },
  {
    id: 15,
    predictionDescription: 'Release doubt — confidence will follow.',
  },
  {
    id: 16,
    predictionDescription: 'Your potential grows with each passing moment.',
  },
  {
    id: 17,
    predictionDescription: 'Today is a canvas — paint it with kindness.',
  },
  {
    id: 18,
    predictionDescription: 'What you resist will persist — let it flow.',
  },
  {
    id: 19,
    predictionDescription: 'A hidden blessing will reveal itself soon.',
  },
  {
    id: 20,
    predictionDescription: 'Joy hides in the simplest of moments.',
  },
  {
    id: 21,
    predictionDescription: 'Your heart already knows the answer.',
  },
  {
    id: 22,
    predictionDescription: 'Peace finds those who embrace silence.',
  },
  {
    id: 23,
    predictionDescription: 'Allow yourself to dream bigger today.',
  },
  {
    id: 24,
    predictionDescription: 'Not every path is straight — trust the twists ahead.',
  },
  {
    id: 25,
    predictionDescription: 'What seems distant now will soon feel near.',
  },
  {
    id: 26,
    predictionDescription: 'Your strength lies in your calmness.',
  },
  {
    id: 27,
    predictionDescription: 'Magic happens when you stop searching for it.',
  },
  {
    id: 28,
    predictionDescription: 'Be the light in someone else\'s day.',
  },
  {
    id: 29,
    predictionDescription: 'Even the smallest spark can ignite great fires.',
  },
  {
    id: 30,
    predictionDescription: 'Gratitude will open doors that effort cannot.',
  },
]

const fontRobotoBold = 'Roboto-Bold';
const fontRobotoReg = 'Roboto-Regular';
const fontRobotoItalicMedium = 'Roboto-MediumItalic';


const PredictionScreen = ({ selectedPage }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const [todayFact, setTodayFact] = useState(null);
  const [todayRecomendation, setTodayRecomendation] = useState(null);
  const [isMeditationRunning, setIsMeditationRunning] = useState(false);
  const [isMeditationModalVisible, setIsMeditationModalVisible] = useState(false);
  const [isCookieOpened, setIsCookieOpened] = useState(false);
  const [generatedPrediction, setGeneratedPrediction] = useState(null);
  const [savedPredictions, setSavedPredictions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 250);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const fetchSavedPredictions = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedPredictions');
        setSavedPredictions(saved ? JSON.parse(saved) : []);
      } catch (error) {
        console.error('Помилка завантаження збережених локацій:', error);
      }
    };

    fetchSavedPredictions();
  }, [selectedPage,]);


  const getRandomPrediction = async () => {
    try {
      const usedPredictionsKey = `usedLocations_${1}`;
      const usedPredictions = JSON.parse(await AsyncStorage.getItem(usedPredictionsKey)) || [];

      const availablePredictions = predictions.filter(
        (predict) => !usedPredictions.includes(predict.id)
      );

      if (availablePredictions.length === 0) {
        await AsyncStorage.removeItem(usedPredictionsKey);
        return getRandomPrediction();
      }

      const randomIndex = Math.floor(Math.random() * availablePredictions.length);
      const randomPrediction = availablePredictions[randomIndex];

      usedPredictions.push(randomPrediction.id);
      await AsyncStorage.setItem(usedPredictionsKey, JSON.stringify(usedPredictions));

      return randomPrediction;
    } catch (error) {
      console.error('Error fetching random prediction:', error);
    }
  };

  const handleGeneratePrediction = async () => {
    const randomPrediction = await getRandomPrediction();
    setGeneratedPrediction(randomPrediction);
  };


  const isGeneratedSaved = useMemo(() => {
    return generatedPrediction && savedPredictions.some((predict) => predict.id === generatedPrediction.id);
  }, [generatedPrediction, savedPredictions]);


  const savePrediction = async (prediction) => {
    try {
      const saved = await AsyncStorage.getItem('savedPredictions');
      const parsedPredictions = saved ? JSON.parse(saved) : [];

      const predictionIndex = parsedPredictions.findIndex((predict) => predict.id === prediction.id);

      if (predictionIndex === -1) {
        const updatedPredictions = [prediction, ...parsedPredictions];
        await AsyncStorage.setItem('savedPredictions', JSON.stringify(updatedPredictions));
        setSavedPredictions(updatedPredictions);
        console.log('Prediction збережена');
      } else {
        const updatedPredictions = parsedPredictions.filter((predict) => predict.id !== prediction.id);
        await AsyncStorage.setItem('savedPredictions', JSON.stringify(updatedPredictions));
        setSavedPredictions(updatedPredictions);
        console.log('Prediction видалена');
      }
    } catch (error) {
      console.error('Помилка збереження/видалення prediction:', error);
    }
  };


  const shareFact = async (description) => {
    try {
      if (!description) {
        Alert.alert('Error', 'No prediction here');
        return;
      }
      await Share.share({
        message: `My generated prediction is '${description}' I found it in the app MinSpirit: Countdown of Time!`,
      });
    } catch (error) {
      console.error('Error prediction:', error);
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
                  Foreseen Moments
                </Text>
              </View>

            </View>
          </View>



          <View
            style={{

              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: dimensions.height * 0.02,

            }}>

            <Image
              source={!isCookieOpened ? require('../assets/images/cookieImage.png') : require('../assets/images/openedCookieImage.png')}
              style={{
                width: !isCookieOpened ? dimensions.width * 0.37 : dimensions.width * 0.43,
                height: !isCookieOpened ? dimensions.width * 0.37 : dimensions.width * 0.43,
                textAlign: 'center'
              }}
              resizeMode="contain"
            />
          </View>

          {isCookieOpened && (

            <Text
              style={{ fontFamily: fontRobotoItalicMedium, fontSize: dimensions.width * 0.04, color: 'white', textAlign: 'center', }}
            >
              {isGenerating ? `Generating${dots}` : generatedPrediction ? generatedPrediction.predictionDescription : ''}
            </Text>
          )}


          {!isCookieOpened && isGenerating && (

            <Text
              style={{ 
                fontFamily: fontRobotoItalicMedium, 
                fontSize: dimensions.width * 0.04, 
                color: 'white', 
                textAlign: 'center', 
                marginVertical: dimensions.height * 0.02,
              }}
            >
              Generating{dots}
            </Text>
          )}


          {isCookieOpened && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: dimensions.height * 0.02,
                marginBottom: dimensions.height * 0.02,
              }}>
              <TouchableOpacity onPress={() => { savePrediction(generatedPrediction) }} disabled={isGeneratedSaved}>

                <Image
                  source={require('../assets/icons/likeIcon.png')}
                  style={{
                    width: dimensions.width * 0.086,
                    height: dimensions.width * 0.086,
                    marginRight: dimensions.width * 0.016,
                    opacity: isGeneratedSaved ? 0.5 : 1,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { shareFact(generatedPrediction.predictionDescription) }}>

                <Image
                  source={require('../assets/icons/sharePinkIcon.png')}
                  style={{
                    width: dimensions.width * 0.086,
                    height: dimensions.width * 0.086,
                    marginLeft: dimensions.width * 0.016,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            disabled={isGenerating}
            onPress={() => {
              setTimeout(() => {
                setIsGenerating(false);
                handleGeneratePrediction();
                setIsCookieOpened(true)

              }, 3000)
              setIsGenerating(true);
            }}

            style={{
              width: '100%',
              backgroundColor: '#00F2A0',
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: dimensions.width * 0.07,
              marginVertical: dimensions.height * 0.01,
              alignItems: 'center',
              opacity: isGenerating ? 0.7 : 1,
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
              Generate
            </Text>

            <Image
              source={require('../assets/icons/starsIcon.png')}
              style={{
                width: dimensions.width * 0.07,
                height: dimensions.width * 0.07,
                marginLeft: dimensions.width * 0.01,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>





          <View style={{marginBottom: dimensions.height * 0.16}}>

            {savedPredictions.map((predict, index) => (
              <TouchableOpacity
                key={predict.id}
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
                }}
                onPress={() => { shareFact(predict.predictionDescription) }}
                onLongPress={() =>
                  Alert.alert(
                    'Delete Prediction?',
                    'Are you sure you want to delete this prediction from your saved list?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => savePrediction(predict), style: 'destructive' },
                    ],
                    { cancelable: true }
                  )
                }
              >
                <View
                  style={{
                    flex: 1,
                    alignSelf: 'center',
                    paddingVertical: dimensions.width * 0.04,
                  }}
                >
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
                    {predict.predictionDescription}
                  </Text>
                </View>

                <Image
                  source={require('../assets/icons/shareIcon.png')}
                  style={{
                    width: dimensions.width * 0.064,
                    height: dimensions.width * 0.064,
                    textAlign: 'center',
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>


        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PredictionScreen;
