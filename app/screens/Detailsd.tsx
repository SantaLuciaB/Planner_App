import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { getDocs, collection, query, where,deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

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
}

const Detailsd = ({ navigation, route }: Props) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const { date } = route.params || {};

    useEffect(() => {
        if (date) {
          const q = query(
            collection(FIREBASE_DB, 'events'),
            where('date', '==', date)
          );
          getDocs(q)
            .then(querySnapshot => {
              const plansData: Plan[] = [];
              querySnapshot.forEach((doc) => {
                plansData.push({
                  id: doc.id,
                  plan: doc.data().plan
                });
              });
              setPlans(plansData);
            })
            .catch((error) => {
              console.log('Error getting documents: ', error);
            });
        }
      }, [date]);

    const handleDelete = (id: string) => {
        deleteDoc(doc(FIREBASE_DB, 'events', id));
        setPlans(plans.filter((plan) => plan.id !== id));
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{date || 'No date selected'}</Text>
            {plans.map((plan) => (
                <View key={plan.id}>
                    <Text>{plan.plan}</Text>
                    <Button title="Delete" onPress={() => handleDelete(plan.id)} />
                </View>
            ))}
            <Button onPress={() => navigation.goBack()} title="Back" />
        </View>
    );
}

export default Detailsd;