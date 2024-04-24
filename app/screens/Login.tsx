import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Image, Pressable, Switch, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RegisterScreen from './RegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Props = {
    navigation: NativeStackNavigationProp<any>;
}

const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            if (response) {
                if (remember) {
                    // Salvăm email-ul și parola în AsyncStorage
                    await AsyncStorage.setItem('userCredentials', JSON.stringify({ email, password }));
                } else {
                    // Ștergem datele de autentificare salvate dacă utilizatorul nu dorește să fie memorat
                    await AsyncStorage.removeItem('userCredentials');
                }
                navigation.navigate('List', { screen: 'List' });
            }
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed' + error.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const savedCredentials = await AsyncStorage.getItem('userCredentials');
                if (savedCredentials !== null) {
                    const { email, password } = JSON.parse(savedCredentials);
                    setEmail(email);
                    setPassword(password);
                    setRemember(true);
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error);
            }
        };
    
        loadSavedCredentials();
    }, []);
    


    function navigateToRegister() {
        navigation.navigate('RegisterScreen', { screen: 'RegisterScreen' });
    }

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/login.png')} style={styles.image} resizeMode='contain' />
            {/* <Text style={styles.title}>Login</Text> */}
            <View style={styles.inputView}>
                <TextInput
                    value={email}
                    style={styles.input}
                    placeholder='Email'
                    autoCapitalize="none"
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    secureTextEntry={true}
                    value={password}
                    style={styles.input}
                    placeholder='Parola'
                    autoCapitalize="none"
                    onChangeText={(text) => setPassword(text)}
                />
            </View>
            <View style={styles.rememberView}>
                <View style={styles.switch}>
                    <Switch
                        value={remember}
                        onValueChange={setRemember}
                        trackColor={{ true: 'green', false: 'gray' }}
                    />
                    <Text style={styles.rememberText}>Memorează-mă</Text>
                </View>
                <Pressable onPress={() => navigation.navigate('ResetPassword')}>
  <Text style={styles.forgetText}>Ai uitat parola?</Text>
</Pressable>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={signIn}
                        style={[styles.button, { backgroundColor: '#D6CDEA' }]}
                    >
                        <Text style={styles.buttonText}>Autentificare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        style={[styles.button, { backgroundColor: '#D6CDEA' }]}
                    >
                        <Text style={styles.buttonText}>Înregistrare</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: 160,
        width: 170,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        paddingVertical: 40,
        color: 'red',
    },
    inputView: {
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    input: {
        height: 50,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    rememberView: {
        width: '100%',
        paddingHorizontal: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 20,
    },
    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    rememberText: {
        fontSize: 16,
    },
    forgetText: {
        fontSize: 16,
        color: 'red',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
