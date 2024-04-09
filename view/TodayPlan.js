import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';



const TASKS_STORAGE_KEY = 'TASKS_STORAGE_KEY';

const TodayPlan = () => {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null); // 新增状态，用于追踪选中的图片URI
  const [modalVisible, setModalVisible] = useState(false); // 新增状态，用于追踪modal是否可见



  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // 请求权限
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      }
  
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'Library permission is required to use images from your phone.');
      }
    })();
  }, []);

// 图库选择图片
const pickImage = async (task) => {
    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    console.log('Image picker result:', imageResult);
  
    if (!imageResult.cancelled && imageResult.assets && imageResult.assets.length > 0) {
      const uri = imageResult.assets[0].uri;
      console.log('Image picked for task:', task.id, uri);
  
      const newTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, imageUri: uri };
        }
        return t;
      });
      setTasks(newTasks);
      await saveTasks(newTasks);
    }
  };
  

    //拍照
  const takePhoto = async (task) => {
    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    console.log('Camera result:', cameraResult);
  
    if (!cameraResult.cancelled && cameraResult.assets && cameraResult.assets.length > 0) {
      const uri = cameraResult.assets[0].uri;
      console.log('Photo taken for task:', task.id, uri);
  
      const newTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, imageUri: uri };
        }
        return t;
      });
      setTasks(newTasks);
      await saveTasks(newTasks);
    }
  };
  
  


  // 展示大图的modal
  const renderImageViewerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Image source={{ uri: selectedImageUri }} style={styles.fullImage} />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );




  // 切换任务完成状态
  const toggleTaskCompletion = (id) => {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks.');
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      const stringifiedTasks = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, stringifiedTasks);
      console.log('Tasks saved:', tasksToSave); // 调试信息
    } catch (error) {
      Alert.alert('Error', 'Failed to save tasks.');
      console.error('Error saving tasks:', error); // 调试信息
    }
  };

  const handleAddTask = () => {
    if (!inputText) return;
    const newTask = { id: Date.now(), text: inputText, completed: false };
    setTasks([...tasks, newTask]);
    setInputText('');
  };

  const handleDeleteTask = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK', onPress: () => {
          setTasks(tasks.filter((task) => task.id !== id));
        }
      }
    ]);
  };

  const handleEditTask = (id, text) => {
    setEditingTaskId(id);
    setInputText(text);
  };

  const handleSaveEdit = () => {
    const newTasks = tasks.map((task) => {
      if (task.id === editingTaskId) {
        return { ...task, text: inputText };
      }
      return task;
    });
    setTasks(newTasks);
    saveTasks(newTasks);
    setEditingTaskId(null);
    setInputText('');
  };




  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
        <Ionicons 
          name={item.completed ? "checkbox" : "square-outline"} 
          size={24} 
          color={item.completed ? "blue" : "black"} 
        />
      </TouchableOpacity>
      <TextInput
        style={[styles.taskInput, item.completed && styles.completedTaskText]}
        onChangeText={(text) => setInputText(text)}
        value={item.id === editingTaskId ? inputText : item.text}
        editable={true}
        onFocus={() => handleEditTask(item.id, item.text)}
      />


      {/* Take photo button */}
      <TouchableOpacity onPress={() => takePhoto(item)}>
        <FontAwesome name="camera" size={24} color="black" style={styles.iconButton} />
      </TouchableOpacity>

      {/* 从相册选择图片按钮 */}
      <TouchableOpacity onPress={() => pickImage(item)}>
        <FontAwesome name="image" size={24} color="black" style={styles.iconButton} />
      </TouchableOpacity>
      
      {/* Show image thumbnail */}
    {item.imageUri ? (
      <TouchableOpacity onPress={() => {
        setSelectedImageUri(item.imageUri);
        setModalVisible(true);
      }}>
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      </TouchableOpacity>
    ) : (
      <Text style={styles.noImageText}>No Pictures</Text>
    )}

      {/* 编辑和删除按钮 */}
        <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => {
          if (editingTaskId === item.id) {
            handleSaveEdit();
          } else {
            handleEditTask(item.id, item.text);
          }
        }}>
        <AntDesign name={editingTaskId === item.id ? "check" : "edit"} size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteTask(item.id)}>
        <AntDesign name="delete" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
        {renderImageViewerModal()}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="New to-do list"
                onChangeText={setInputText}
                value={inputText}
              />
              <TouchableOpacity onPress={editingTask ? handleSaveEdit : handleAddTask}>
                <Text style={styles.addButtonText}>{editingTask ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>To-do List</Text>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    // 增加间隔
    marginBottom: 15,
  },
  taskInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    // 通过这里控制输入框的高度
    height: 40,
    // 如果希望有更多内部间距可以调整padding值
    paddingVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dedede',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  iconButton: {
    // 图标之间的间隔
    marginHorizontal: 10,
  },
  addButtonText: {
    fontSize: 18,
    color: '#0066cc',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    padding: 8,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  noImageText: {
    fontSize: 16,
    marginRight: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  fullImage: {
    width: 300, // 设置合适的值
    height: 300, // 设置合适的值
    resizeMode: 'contain'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
});

export default TodayPlan;
