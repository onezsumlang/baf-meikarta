import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {Text, Button} from "react-native-elements";
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Context as ReportContext } from '../context/ReportContext';

const ScannerScreen = ({ navigation }) => {
    const { state } = useContext(ReportContext);
    const { currentReportAsset } = state;
    const { headerTitle, zone, parentScreen } = navigation.state.params;
    
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [listItem, setListItem] = useState([]);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <Text>{'OKEE'}</Text>
//       ),
//     });
//   }, [navigation]);

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

  const alertError = (msg) =>{
    Alert.alert(
      'Oopss..',
      msg,
      [ { text: 'Ok' } ]
    )
  }
  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const checkAsset = currentReportAsset.find(v => v.qrcode == data && v.remark.toLowerCase() == ('Zone ' + zone).toLowerCase());
    if(!checkAsset) return alertError(`Wrong QR Code for Zone ${zone}`);

    if(parentScreen == 'Report') navigation.navigate('ReportDetail', { headerTitle });
    if(parentScreen == 'Resolve') navigation.navigate('ResolveListTable', { headerTitle });
  };

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

export default ScannerScreen;