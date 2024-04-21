import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { getDocs, collection, query, where, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  date?: string;
}

interface Props {
  navigation: StackNavigationProp<any, 'details'>;
  route: RouteProp<any, 'details'>;
}

interface Plan {
  id: string;
  plan: string;
  done: boolean;
  starred: boolean;
  hour: String;
}

const DetailsScreen = ({ navigation, route }: Props) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState('');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const { date } = route.params || {};

  useEffect(() => {
    if (date) {
      loadPlansForDate(date);
      loadCheckedItems();
    }
  }, [date]);

  const loadPlansForDate = async (selectedDate: string) => {
    const q = query(collection(FIREBASE_DB, 'events'), where('date', '==', selectedDate));
    const querySnapshot = await getDocs(q);
    const plansData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      plan: doc.data().plan,
      done: doc.data().done,
      starred: doc.data().starred || false,
      hour: doc.data().hour,
    }));
    setPlans(plansData);
  };

  const loadCheckedItems = async () => {
    try {
      const checkedItemsString = await AsyncStorage.getItem('checkedItems');
      if (checkedItemsString !== null) {
        const checkedItemsArray = JSON.parse(checkedItemsString);
        setCheckedItems(checkedItemsArray);
      }
    } catch (error) {
      console.error('Error loading checked items:', error);
    }
  };

  const saveCheckedItems = async (checkedItemsArray: string[]) => {
    try {
      await AsyncStorage.setItem('checkedItems', JSON.stringify(checkedItemsArray));
    } catch (error) {
      console.error('Error saving checked items:', error);
    }
  };

  const handleCheckboxToggle = async (id: string) => {
    const updatedPlans = plans.map((p) => {
      if (p.id === id) {
        return { ...p, done: !p.done };
      }
      return p;
    });

    setPlans(updatedPlans);

    const updatedCheckedItems = checkedItems.includes(id)
      ? checkedItems.filter((item) => item !== id)
      : [...checkedItems, id];
    setCheckedItems(updatedCheckedItems);
    saveCheckedItems(updatedCheckedItems);
  };

  const handleEdit = async (id: string, updatedPlan: string) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'events', id), { plan: updatedPlan });
      setPlans(plans.map((p) => p.id === id ? { ...p, plan: updatedPlan } : p));
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleStarToggle = async (id: string) => {
    const updatedPlan = plans.find((p) => p.id === id);
    if (updatedPlan) {
      await updateDoc(doc(FIREBASE_DB, 'events', id), { starred: !updatedPlan.starred });
      setPlans(plans.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(FIREBASE_DB, 'events', id));
    setPlans(plans.filter((plan) => plan.id !== id));
  };

  const handleAddPlan = async () => {
    if (newPlan) {
      await addDoc(collection(FIREBASE_DB, 'events'), { date, plan: newPlan, done: false, starred: false });
      setNewPlan('');
      loadPlansForDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalii Activități</Text>
      <Text style={styles.date}>{formatDate(date)}</Text>
      <TextInput
        style={styles.input}
        onChangeText={setNewPlan}
        value={newPlan}
        placeholder="Adaugă un plan nou"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddPlan}>
        <Text style={styles.buttonText}>Adaugă</Text>
      </TouchableOpacity>
      <View style={styles.list}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.listItem}>
            <Checkbox
              value={plan.done}
              onValueChange={() => handleCheckboxToggle(plan.id)}
            />
            <Text style={plan.done ? styles.doneText : styles.planText}>{plan.plan}</Text>
            <Text style={styles.hourText}>Ora: {plan.hour}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(plan.id, plan.plan)}>
              <Ionicons name="create-outline" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.starButton} onPress={() => handleStarToggle(plan.id)}>
              <Ionicons name={plan.starred ? 'star' : 'star-outline'} size={24} color="gold" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(plan.id)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Înapoi</Text>
      </TouchableOpacity>
    </View>
  );
};

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    fontFamily: 'DancingScript',
    marginBottom: 10,
    textAlign: 'center',
    paddingTop: 40,
  },
  date: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#D6CDEA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  planText: {
    fontSize: 18,
    flex: 1,
  },
  doneText: {
    fontSize: 18,
    color: 'gray',
    textDecorationLine: 'line-through',
  },
  editButton: {
    marginLeft: 10,
  },
  starButton: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: '#d7ecd1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  hourText: {
    fontSize: 16,
    color: '#555',
  },
});

export default DetailsScreen;
