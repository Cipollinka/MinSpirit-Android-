import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Animated, Text, TouchableOpacity, ImageBackground, Dimensions, Image, Platform, TextInput, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import minSpiritOnboardingData from '../components/minSpiritOnboardingData';
import { useNavigation } from '@react-navigation/native';
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledView = styled(View);

const fontRobotoBold = 'Roboto-Bold';
const fontRobotoReg = 'Roboto-Regular';
const fontMontserSemBold = 'Montserrat-SemiBold';

const OnboardingScreen = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);
  const navigation = useNavigation();
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollNextSlide = () => {
    slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
  };


  useEffect(() => {
    const onChange = ({ window }) => {
      setDimensions(window);
    };
    const dimensionListener = Dimensions.addEventListener('change', onChange);
    return () => {
      dimensionListener.remove();
    };

  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;


  const renderItem = ({ item }) => (
    <ImageBackground
      source={require('../assets/images/onboardingBackground.png')}
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
      }}
      resizeMode="cover"
    >

      <SafeAreaView style={{
        alignItems: 'center',
        width: dimensions.width,
        position: 'relative',
        justifyContent: 'flex-start',
        flex: 1,

      }} >
        <View style={{
          alignSelf: 'center',
          position: 'absolute',
          height: dimensions.width < 380 ? '25%' : '23%',
          alignItems: 'center',
          zIndex: 0,
          width: '90%',
          bottom: '8%',
          borderRadius: '8%',
        }}>

          <Text
            style={{
              fontFamily: fontRobotoBold,
              alignSelf: 'flex-start',
              fontSize: dimensions.width * 0.055,
              color: 'white',
              maxWidth: '100%',
              textAlign: 'left',
            }}>
            {item.title}
          </Text>
          <Text
            style={{
              alignSelf: 'flex-start',
              fontFamily: fontRobotoReg,
              fontSize: dimensions.width * 0.044,
              marginTop: 8,
              maxWidth: '100%',
              color: 'white',
              textAlign: 'left',

            }}>
            {item.description}
          </Text>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );

  return (
    <StyledView
      style={{ justifyContent: 'space-between', flex: 1, backgroundColor: '#06263D', alignItems: 'center', }}
    >
      <StyledView style={{ display: 'flex' }}>
        <FlatList
          data={minSpiritOnboardingData}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled
          bounces={false}
          scrollEnabled={currentIndex === 0}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          scrollEventThrottle={32}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </StyledView>

      <StyledTouchableOpacity
        onPress={() => {
          if (currentIndex === minSpiritOnboardingData.length - 1) {
            navigation.navigate('Timer');
          } else scrollNextSlide();
        }}
        style={{
          paddingVertical: 16,
          bottom: '12%',
          borderRadius: 1000,
          alignSelf: 'center',
          paddingHorizontal: 28,
          marginBottom: 40,
          width: '90%',
          backgroundColor: '#E92BBD',

        }}
      >
        <Text
          style={{
            fontFamily: fontMontserSemBold,
            textAlign: 'center', fontWeight: 600,
            color: 'white',
            fontSize: minSpiritOnboardingData.length - 1 ?
              dimensions.width * 0.04 : dimensions.width * 0.05,
          }}>
          {currentIndex === minSpiritOnboardingData.length - 1 ? "Start" : "Next"}
        </Text>
      </StyledTouchableOpacity>

    </StyledView>
  );
};

export default OnboardingScreen;
