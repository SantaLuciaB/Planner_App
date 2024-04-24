// InsideLayout.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import List from '../app/screens/List';
import Details from '../app/screens/Detailsd';

const Stack = createNativeStackNavigator();

const InsideLayout = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Calendar" component={List} />
      {/* <Stack.Screen name="details" component={Details} /> */}
    </Stack.Navigator>
  );
};

export default InsideLayout;
