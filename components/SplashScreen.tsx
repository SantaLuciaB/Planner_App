import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';

type SplashScreenProps = {
  navigation: any;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  useEffect(() => {
    console.log(['splash'])
    const timeoutId = setTimeout(() => {
      // Navigate to the login screen after 5 seconds
      navigation.navigate('Login',{screen:'LoginScreen'});
    }, 5000);

    // Clean up the timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <LottieView
      source={require('../assets/Splash.json')}
      autoPlay
      loop
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default SplashScreen;