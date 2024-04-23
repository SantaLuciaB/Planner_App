import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './app/screens/Login';
import RegisterScreen from './app/screens/RegisterScreen';
import List from './app/screens/List';
import Detailsd from './app/screens/Detailsd';
import ResetPasswordScreen from './app/screens/resetPaswordScreen';
import { DancingScript_400Regular,DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { useFonts } from 'expo-font';


const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [fontsLoaded] = useFonts({
    DancingScript: DancingScript_400Regular,
    DancingScriptBold: DancingScript_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log('user', currentUser);
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return null; // Poți afișa un indicator de încărcare sau altceva până când fonturile sunt încărcate complet
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        {user ? (
          <>
            <Stack.Screen name='List' component={List} options={{ headerShown: false }} />
            <Stack.Screen name='details' component={Detailsd} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Register' component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name='ResetPassword' component={ResetPasswordScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
