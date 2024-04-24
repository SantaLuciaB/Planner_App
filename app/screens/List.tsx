import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { Calendar } from 'react-native-calendars';
import { addDoc, collection, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

interface DayPlan {
    date: string;
    plan: string;
    hour: Timestamp;
    id: string;
}

const List = ({ navigation }: RouterProps) => {
    const [planText, setPlanText] = useState('');
    const [planHour, setPlanHour] = useState('00');
    const [planMinute, setPlanMinute] = useState('00');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        handleDateSelect(currentDate);
    }, []);

    const handleDateSelect = useCallback((date: string) => {
        setSelectedDate(date);
        loadPlanFromFirebase(date);
    }, []);

    const loadPlanFromFirebase = useCallback(async (date: string) => {
        const q = query(collection(FIREBASE_DB, 'events'), where('date', '==', date));
        const querySnapshot = await getDocs(q);
        const plans: DayPlan[] = [];
        querySnapshot.forEach((doc) => {
            plans.push({
                date: doc.data().date,
                plan: doc.data().plan,
                hour: doc.data().hour,
                id: doc.id
            });
        });
        setDayPlans(plans);
    }, []);

    const addPlanToFirebase = useCallback(async (date: string, plan: string, hour: string, minute: string) => {
        await addDoc(collection(FIREBASE_DB, 'events'), {
            date: date,
            plan: plan,
            hour: hour + ':' + minute,
            done: false
        });
        loadPlanFromFirebase(date);
        setPlanText('');
        setPlanHour('00');
        setPlanMinute('00');
    }, [loadPlanFromFirebase]);

    const deletePlanFromFirebase = useCallback(async (id: string) => {
        await deleteDoc(doc(FIREBASE_DB, 'events', id));
        loadPlanFromFirebase(selectedDate || '');
    }, [loadPlanFromFirebase, selectedDate]);

    const markedDates = useMemo(() => {
        return Object.fromEntries(dayPlans.map(dayPlan => [dayPlan.date, {
            marked: true,
            dotColor: '#ff69b4',
            selected: selectedDate === dayPlan.date,
            selectedColor: '#c0c0c0',
            selectedDotColor: '#ff69b4', // add this line
          }]));
      }, [dayPlans, selectedDate]);
      const plansCountForSelectedDate = useMemo(() => {
        return dayPlans.length;
    }, [dayPlans]);

    const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('ro-RO') : '';

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40, backgroundColor: '#f5f5f5' }}>
            <Text style={styles.titleText}>Ce planuri ai?</Text>
            <Calendar
                onDayPress={(day) => handleDateSelect(day.dateString)}
                markedDates={markedDates}
                markedDatesStyle={{
                    day: {
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        opacity: 0.3,
                    },
                    selectedDay: {
                        borderRadius: 12,
                    },
                    selectedDot: {
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#ff69b4', // set the color of the selected dot
                    },
                }}
            />
          {selectedDate && (
        <View>
            <Text style={styles.addPlanText}>Adaugă un plan nou pentru data de: {formattedDate} :</Text>
        </View>
    )}
            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Introdu un plan"
                    onChangeText={(text) => setPlanText(text)}
                    value={planText}
                    style={styles.input}
                    textContentType="none"
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RNPickerSelect
                        placeholder={{ label: 'Select hour', value: null }}
                        onValueChange={(value) => setPlanHour(value)}
                        items={[
                            ...Array.from({ length: 24 }, (_, i) => ({
                                label: i < 10 ? '0' + i.toString() : i.toString(),
                                value: i < 10 ? '0' + i.toString() : i.toString(),
                            }))
                        ]}
                        style={pickerSelectStyles}
                    />
                    <Text style={{ marginHorizontal: 5 }}>:</Text>
                    <RNPickerSelect
                        placeholder={{ label: 'Select minute', value: null }}
                        onValueChange={(value) => setPlanMinute(value)}
                        items={[
                            ...Array.from({ length: 60 }, (_, i) => ({
                                label: i < 10 ? '0' + i.toString() : i.toString(),
                                value: i < 10 ? '0' + i.toString() : i.toString(),
                            }))
                        ]}
                        style={pickerSelectStyles}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => addPlanToFirebase(selectedDate || '', planText, planHour, planMinute)}
                    style={styles.addButton}
                >
                    <Text style={styles.buttonText}>Adaugă Plan</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.plansCountText}>
        Pentru {formattedDate} ai {plansCountForSelectedDate} planuri.
    </Text>
            {/* <ScrollView style={{ marginTop: 20 }}>
                {dayPlans.map((dayPlan) => (
                    <View key={dayPlan.id} style={styles.planContainer}>
                        <Text style={styles.planText}>{dayPlan.plan} ({dayPlan.hour})</Text>
                        <TouchableOpacity
                            onPress={() => deletePlanFromFirebase(dayPlan.id)}
                            style={[styles.deleteButton, { marginTop: 20 }]}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView> */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('details', { date: selectedDate })}
                    style={[styles.button, { flex: 1 }]}
                >
                    <Text style={styles.buttonText}>Detalii</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => FIREBASE_AUTH.signOut().then(() => navigation.navigate('Login', { screen: 'LoginScreen' }))}
                    style={[styles.button, { flex: 1 }]}
                >
                    <Text style={styles.buttonText}>Ieși din cont</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'DancingScriptBold',
        color: '#333333',
        textTransform: 'uppercase',
        marginBottom: 20,
        textAlign: 'center',
    },
    plansCountText: {
        fontSize: 30,
        fontFamily: 'DancingScriptBold',
        color: '#2d4150',
        textAlign: 'center',
        marginBottom: 10,
        marginTop:30,
    },
    planContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
    planText: {
        color: '#2d4150',
        fontSize: 18,
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#ff69b4',
        padding: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#ffffff',
        fontSize: 18,
    },
    addPlanText: {
        color: '#2d4150',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#039c7b',
        borderWidth: 1,
        marginTop: 10,
        paddingLeft: 10,
        flex: 1,
        borderRadius: 5,
    },
    addButton: {
        backgroundColor: '#D6CDEA',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 20,
    },
    button: {
        backgroundColor: '#D6CDEA',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#039c7b',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
        marginLeft: 5,
        width: 60,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
        marginLeft: 10,
        width: 80,
    },
});

export default List;
