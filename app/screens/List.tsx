import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { Calendar } from 'react-native-calendars';
import { addDoc, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

interface DayPlan {
    date: string;
    plan: string;
    hour: string;
    id: string;
}

const List = ({ navigation }: RouterProps) => {
    const [planText, setPlanText] = useState('');
    const [planHour, setPlanHour] = useState('');
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

    const addPlanToFirebase = useCallback(async (date: string, plan: string, hour: string) => {
        await addDoc(collection(FIREBASE_DB, 'events'), {
            date: date,
            plan: plan,
            hour: hour,
            done: false
        });
        loadPlanFromFirebase(date);
        setPlanText('');
        setPlanHour('');
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
            selectedDotColor: '#ffffff',
        }]));
    }, [dayPlans, selectedDate]);

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40, backgroundColor: '#f5f5f5' }}>
            <Text style={styles.titleText}>Ce planuri ai?</Text>
            <Calendar
                onDayPress={(day) => handleDateSelect(day.dateString)}
                markedDates={markedDates}
                theme={{
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#ff69b4',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#00adf5',
                    monthTextColor: '#00adf5',
                    textDayFontFamily: 'monospace',
                    textMonthFontFamily: 'monospace',
                    textDayHeaderFontFamily: 'monospace',
                    textDayFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                    textDayFontSize: 18,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 18
                }}
            />
            {selectedDate && (
                <Text style={styles.addPlanText}>Adaugă un plan nou pentru data de: {selectedDate}</Text>
            )}
            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Introdu un plan"
                    onChangeText={(text) => setPlanText(text)}
                    value={planText}
                    style={styles.input}
                    textContentType="none"
                />
                <TextInput
                    placeholder="Introdu ora"
                    onChangeText={(text) => setPlanHour(text)}
                    value={planHour}
                    style={[styles.input, { width: 80, marginLeft: 10 }]}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    onPress={() => addPlanToFirebase(selectedDate || '', planText, planHour)}
                    style={styles.addButton}
                >
                    <Text style={styles.buttonText}>Adaugă Plan</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 20 }}>
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
            </ScrollView>
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
        fontStyle: 'italic',
        color: '#333333',
        textTransform: 'uppercase',
        marginBottom: 20,
        textAlign: 'center',
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
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingLeft: 10,
        flex: 1,
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
        marginTop: 20,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#D6CDEA',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
});

export default List;
