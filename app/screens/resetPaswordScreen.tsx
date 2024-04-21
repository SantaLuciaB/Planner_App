import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const ResetPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');

  const auth = FIREBASE_AUTH;

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Eroare', 'Vă rugăm să introduceți adresa de email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Succes', 'Un link de resetare a parolei a fost trimis la adresa dvs. de email.');
    } catch (error: any) {
      console.log(error);
      Alert.alert('Eroare', error.message);
    }
  };

  return (
    <View style={styles.container}>
     <Image source={require('../../assets/forgot-password.png')} style={styles.image} />
      <Text style={styles.titleText}>Ți-ai uitat parola?</Text> 
      
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          Introdu adresa de email pentru a primi un link de resetare a parolei.
        </Text>
      </View>
      <View style={styles.inputView}>
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Trimite Link de Resetare</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Înapoi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    paddingTop:60,
    
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 50,
  },
  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'justify',
    lineHeight: 24,
  },
  inputView: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#D6CDEA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position:'absolute',
    bottom:60,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    position:'absolute',
    bottom:10,
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default ResetPasswordScreen;
