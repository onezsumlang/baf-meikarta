import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {Text, Button} from "react-native-elements";
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const Barcode = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [listItem, setListItem] = useState([]);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    Alert.alert(
      'Scanned Item !',
      data + '\n\nAre you sure want to process this asset ?',
      [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          onPress: () => {
            setListItem([...listItem, data]);
          }
        },
      ]
    )
  };

  const handleDeleteItem = (key) => {
    Alert.alert(
      'Remove Item',
      listItem[key] + '\n\nAre you sure want to remove this asset from list ?',
      [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          onPress: () => {
            listItem.splice(key, 1);

            setListItem([...listItem]);
          }
        },
      ]
    )
  }

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>)
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }

  // Return the View
  return (<>
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{width: 600, height: 600}}
        />
      </View>
    </View>
    <View style={{marginTop: 30}}>
      <Button buttonStyle={{height: 70, marginTop: 50, marginBottom: 10}} title={`${scanned ? 'Scan again ?':'Scanning...'}`} onPress={() => setScanned(false)} disabled={!scanned} />
    </View>
    <ScrollView style={{paddingHorizontal: 20, height: 90}}>
      {listItem.map( (item, key) => (
        <View key={key} style={styles.card}>
          <Text>{item}</Text>
          <TouchableWithoutFeedback
            onPress={() => handleDeleteItem(key)}
          >
            <Ionicons name="ios-trash" size={20} style={{color: '#d11919'}}></Ionicons>
          </TouchableWithoutFeedback>
        </View>
      ))}
      {listItem.length > 0 &&
        <Button
          buttonStyle={{marginTop: 20, backgroundColor: 'green', borderRadius: 20, height: 55}}
          title={'Submit'}
        ></Button>
      }
    </ScrollView>
    
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 30,
    zIndex: 10
  },
  card: {
    borderColor: 'grey',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2.22,
    elevation: 3,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginVertical: 2,
    marginHorizontal: 2
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
    height: 300,
    overflow: 'hidden',
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: 'tomato'
  }
});

export default Barcode;