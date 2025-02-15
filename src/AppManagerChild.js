import React, {useEffect, useRef, useState} from 'react';
import {
  Linking,
  SafeAreaView,
  StatusBar,
  View,
  Alert,
  BackHandler,
} from 'react-native';
import WebView from 'react-native-webview';
import SendIntentAndroid, {isAppInstalled} from 'react-native-send-intent';

export default function AppManagerChild({navigation, route}) {
  const linkRefresh = route.params.data;
  const userAgent = route.params.userAgent;
  // const userAgent = 'Mozilla/5.0 (Linux; Android 14; SM-G990B2 Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/132.0.6834.163 Mobile Safari/537.36';
  const webViewRef = useRef(null);
  const SendIntentAndroid = require('react-native-send-intent');

  const [isTwoClick, setTwoClick] = useState(false);

  const redirectDomens = ['https://ninecasino.life/#deposit'];

  const openInBrowser = [
    'mailto:',
    'itms-appss://',
    'https://m.facebook.com/',
    'https://www.facebook.com/',
    'https://www.instagram.com/',
    'https://twitter.com/',
    'https://www.whatsapp.com/',
    'https://t.me/',
    'fb://',
    'conexus://',
    'bmoolbb://',
    'cibcbanking://',
    'bncmobile://',
    'rbcmobile://',
    'scotiabank://',
    'pcfbanking://',
    'tdct://',
    'nl.abnamro.deeplink.psd2.consent://',
    'nl-snsbank-sign://',
    'nl-asnbank-sign://',
    'triodosmobilebanking',
    'intent://',
  ];

  function backHandlerButton() {
    if (isTwoClick) {
      navigation.goBack();
      return;
    }
    setTwoClick(true);
    webViewRef.current.goBack();
    setTimeout(() => {
      setTwoClick(false);
    }, 1000);
  }

  useEffect(() => {
    const backActionClick = () => {
      backHandlerButton();
      return true; // повертаємо true, щоб ПРИГЛУШИТИ стандартну поведінку
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backActionClick,
    );

    return () => backHandler.remove();
  }, []);

  const checkLinkInArray = (link, array) => {
    try {
      for (let i = 0; i < array.length; i++) {
        if (link.includes(array[i])) {
          return true;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  const openURLInBrowser = async url => {
    await Linking.openURL(url);
  };

  const onShouldStartLoadWithRequest = event => {
    console.log('CHILD_SHOULD_START_LOAD_WITH_REQUEST', event.url);

    if (event.url.includes('play.google.com/store/apps/details')) {
      openURLInBrowser(event.url);
      return false;
    }

    // if (event.url.includes('intent://')) {
    //   let _appPackage = event.url.split('package=');
    //   let finalPackage = _appPackage[_appPackage.length - 1].split(';')[0];
    //   console.log('openApp');
    //   SendIntentAndroid.openChooserWithOptions({
    //     action: 'android.intent.action.VIEW',
    //         url: event.url,           // The link you want to open
    //       type: 'text/plain', // Optional; helps Android figure out what apps can handle it
    //   },
    //       'Open link with...'
    //   );
    //   return false;
    // }

    if (checkLinkInArray(event.url, openInBrowser)) {
      try {
        console.log('openAppr', event.url);
        if (event.url.split('package=').length !== 1) {
          let _appPackage = event.url.split('package=');
          let finalPackage = _appPackage[_appPackage.length - 1].split(';')[0];
          SendIntentAndroid.isAppInstalled(finalPackage).then(isInstalled => {
            if (isAppInstalled) {
              SendIntentAndroid.openAppWithUri(event.url);
            }
          });
        } else {
          SendIntentAndroid.openAppWithUri(event.url).then((res) => {
            console.log(res);
            if (!res) Alert.alert(
                'Ooops',
                "It seems you don't have the bank app installed, wait for a redirect to the payment page",
            );
          });
        }
        // openURLInBrowser(event.url);
      } catch (error) {
        console.log(error);
        Alert.alert(
          'Ooops',
          "It seems you don't have the bank app installed, wait for a redirect to the payment page",
        );
      }
      return false;
    }

    if (checkLinkInArray(event.mainDocumentURL, redirectDomens)) {
      navigation.navigate('main');
      return false;
    }
    return true;
  };

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar barStyle={'light-content'} />
        <WebView
          originWhitelist={['*', 'http://*', 'https://*']}
          source={{uri: linkRefresh}}
          textZoom={100}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          allowsBackForwardNavigationGestures={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          onError={syntEvent => {
            const {nativeEvent} = syntEvent;
            const {code} = nativeEvent;
            if (code === -1101) {
              navigation.goBack();
            }
            if (code === -10) {
              Alert.alert(
                'Ooops',
                "It seems you don't have the bank app installed, wait for a redirect to the payment page",
              );
              navigation.goBack();
            }
          }}
          onOpenWindow={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            const {targetUrl} = nativeEvent;
            console.log('CHILD_OPEN_WINDOW', targetUrl);
          }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          allowFileAccess={true}
          showsVerticalScrollIndicator={false}
          javaScriptCanOpenWindowsAutomatically={true}
          style={{flex: 1}}
          ref={webViewRef}
          userAgent={userAgent}
        />
      </SafeAreaView>
    </View>
  );
}
