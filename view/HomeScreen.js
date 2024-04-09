import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';//人脸识别


const TASKS_STORAGE_KEY = 'TASKS_STORAGE_KEY';

const HomeScreen = ({ navigation }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); // 使用date-fns来格式化日期
  const [location, setLocation] = useState(null);
  const [tasks, setTasks] = useState([]);


  useEffect(() => {
    (async () => {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    })();
  }, []);


    //获取地点
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

    // 用于渲染每一个待办事项的函数
  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <AntDesign
        name={item.completed ? 'checkcircle' : 'checkcircleo'}
        size={16}
        color={item.completed ? 'green' : 'grey'}
        style={styles.taskIcon}
      />
      <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
        {item.text}
      </Text>
    </View>
  );



  // 验证用户函数
  const authenticateUser = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert("Device does not support biometrics");
      return;
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (supportedTypes.length === 0) {
      Alert.alert("No biometrics set");
      return;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert("No biometrics set");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authentication to access the application",
      fallbackLabel: "Use passwords", // iOS only
    });

    if (result.success) {
      navigation.navigate('TodayPlan');
    } else {
      Alert.alert("validation failure", result.error ? `Error: ${result.error}` : "Please try again");
    }
  };







  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Date: {date}</Text>
        {location && (
          <View>
            <Text style={styles.text}>Location: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</Text>
          </View>
        )}
      </View>
      <View style={[styles.box, styles.tasksContainer]}>
        <Text style={styles.title}>Today's To-Do List</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTaskItem}
        />
      </View>
      <Button
        title="Access to applications"
        onPress={authenticateUser} // 更改为调用 authenticateUser 函数
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '90%',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tasksContainer: {
    borderColor: '#ccc',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskIcon: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
});

export default HomeScreen;
