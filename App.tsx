import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import InsideLayout from './navigators/InsideLayout';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './app/screens/Login';
import RegisterScreen from './app/screens/RegisterScreen';
import List from './app/screens/List';
import Detailsd from './app/screens/Detailsd';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log('user', currentUser);
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        {user? (
          <>
          <Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }} />
          <Stack.Screen name='List' component={List} options={{ headerShown: false }} />
          <Stack.Screen name='details' component={Detailsd} options={{ headerShown: false }} />
          </>
        
        ) : (
          <>
          <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Register' component={RegisterScreen} options={{ headerShown: false }} />
          </>
          
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}