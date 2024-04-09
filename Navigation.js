import * as React from 'react';
import { Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './view/HomeScreen';
import TodayPlan from './view/TodayPlan';


const Stack = createStackNavigator();




function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TodayPlan"
        component={TodayPlan}
        options={({ navigation }) => ({
          headerLeft: () => (
            <Button
              title="Back"
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            />
          ),
        })}
      />

    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}



