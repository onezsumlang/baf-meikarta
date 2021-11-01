import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {Text, Button} from "react-native-elements";
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";

const CheckQR = ({ navigation }) => {
    const { type, block, floor } = navigation.state.params;
    const { state } = useContext(CatatMeterContext);
    const { catatMeterUnits, listElectric, listWater } = state;
    const listData = type == 'Electric' ? listElectric : listWater
    
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

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
  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    // const splitQR = data.split('-');
    // const unitCode = `${splitQR[0]}-${splitQR[1]}-${splitQR[2]}-${splitQR[3]}`; 
    const field = type == 'Electric' ? 'electric_id':'water_id';
    const findUnit = catatMeterUnits.filter(v => v[field] == data && v.floor == floor);
    if(!findUnit || findUnit.length == 0) return Alert.alert('Info', `QR Code not match for Block ${block} - Floor ${floor}`);
    const history = listData.filter(v => v.unit_code == findUnit[0].unit_code);

    navigation.navigate('CM_Form', { detailUnit: findUnit, history, type });
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

export default CheckQR;