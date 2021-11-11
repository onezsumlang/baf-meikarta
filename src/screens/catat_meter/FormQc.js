import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Button, Alert, Image, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";
import { Context as AuthContext } from "../../context/AuthContext";
import moment from "moment";
import RegularImagePicker from "../../components/RegularImagePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from 'expo-barcode-scanner';

const Form = ({ navigation }) => {
  const { detailUnit, history, type, problems, block, tower, floor, tipe } = navigation.state.params;
  const { state: authState } = useContext(AuthContext);
  const { userDetail } = authState;

  const { state, addCatatMeter } = useContext(CatatMeterContext);
  const { catatMeterUnits, listElectric, listWater, listProblem, loading } = state;
  const listData = type == 'Electric' ? listElectric : listWater;

  const dataUnit = (detailUnit || [])[0];
  const listHistory = _.sortBy(history, ['tahun','bulan']);
  const lastInput = listHistory[listHistory.length - 1];

  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    meteran: null,
    pemakaian: null,
    foto: null
  });

  const [showProblems, setShowProblems] = useState(false);
  const listProblems = _.sortBy(problems, ['label']);
  const [problemSelected, setProblemSelected] = useState(null);
  const [modalProblems, setModalProblems] = useState(false);

  const idxNoScan = [1,2,3,15,16,17];
  // console.log(listProblems);

  const [modalCheckQr, setModalCheckQr] = useState(false);
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

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    // const splitQR = data.split('-');
    // const unitCode = `${splitQR[0]}-${splitQR[1]}-${splitQR[2]}-${splitQR[3]}`; 
    const field = type == 'Electric' ? 'electric_id':'water_id';
    const findUnit = catatMeterUnits.filter(v => v[field] == data && v.floor == floor);
    // console.log(findUnit);
    if(!findUnit || findUnit.length == 0) {
      setModalCheckQr(!modalCheckQr);
      setScanned(false);
      return Alert.alert('Info', `QR Code not match for Block ${block} - Floor ${floor}`);
    }
    const history = listData.filter(v => v.unit_code == findUnit[0].unit_code);

    // console.log(history);

    Alert.alert('Info', 'Data Saved!');
    doSubmit();

    // navigation.navigate('CM_QcUnitList');
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

  const onTakingImage = (data) => {
    handleChange('foto', data.photo);
  }

  const handleMeteran = (data) => {
    setForm({
      ...form,
      meteran: data,
      pemakaian: data ? parseFloat(data) - parseFloat(lastInput.meteran) : parseFloat(lastInput.meteran)
    });
  }

  const handleChange = (field, value) => {
    setForm({
      ...form,
      // pemakaian: field == 'meteran' && value ? parseFloat(value) - parseFloat(lastInput.meteran) : parseFloat(lastInput.meteran),
      [field]: value,
    });
  }

  const validation = () => {
    for (const [key, value] of Object.entries(form)) {
      if(key == 'pemakaian'){
        if(!value) return true;
      }else{
        if(!value) return false;
      }
      
    }

    return true;
  }
  const doSubmit = async () => {
    if(!validation()) return Alert.alert('Warning', 'Please complete the form');
    // addCatatMeter(form);

    let checkType = type == "Water" ? 'waters' : 'electrics';

    const dataWaters = checkType == "waters" && {
      waters : [{
        "unit_code"   : dataUnit.unit_code,
        "bulan"       : moment().format('MM'),
        "tahun"       : moment().format('YYYY'),
        "nomor_seri"  : form.meteran,
        "pemakaian"   : form.pemakaian,
        "foto"        : form.foto,
        "insert_by"   : ((userDetail || {}).data || {}).id_user,
        "problem"     : 0,
        "type"        : "QC",
        "idx_problem" : problemSelected == null ? '0' : listProblems[problemSelected].idx,
        "insert_date" : moment().format('YYYY-MM-DD HH:mm:ss')
      }]
    };

    const dataEletrics = checkType !== "waters" && {
      electrics : [{
        "unit_code"   : dataUnit.unit_code,
        "bulan"       : moment().format('MM'),
        "tahun"       : moment().format('YYYY'),
        "nomor_seri"  : form.meteran,
        "pemakaian"   : form.pemakaian,
        "foto"        : form.foto,
        "insert_by"   : ((userDetail || {}).data || {}).id_user,
        "problem"     : 0,
        "type"        : "QC",
        "idx_problem" : problemSelected == null ? '0' : listProblems[problemSelected].idx,
        "insert_date" : moment().format('YYYY-MM-DD HH:mm:ss')
      }]
    };

    let data = {};

    data.waters_problem = dataWaters.waters;
    data.electrics_problem = dataEletrics.electrics;

    const localCM = await JSON.parse(await AsyncStorage.getItem('localCM')) || [];  

    data = [...localCM, data];

    await AsyncStorage.setItem('localCM', JSON.stringify(data));

    addCatatMeter(data);
    navigation.navigate('CM_QcUnitList');
  }

  const handleProblem = () => {
    setShowProblems(true);
    setModalProblems(!modalProblems);
  }

  // console.log(form);

  return (
    <>
      <ScrollView style={styles.screen}>
        <Text style={{ marginBottom: 20, fontSize: 24, fontWeight: 'bold', color: 'darkorange'}}>
          {`Meter ${type} Reading QC`}
        </Text>
        <View style={styles.box}>
          <Text style={styles.textTimer}>Detail Customer</Text>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Nama</Text>
            <Text style={styles.textMD}>: {dataUnit.customer_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Unit Code</Text>
            <Text style={styles.textMD}>: {dataUnit.unit_code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Tanggal HO</Text>
            <Text style={styles.textMD}>: {dataUnit.date_ho}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Avg</Text>
            <Text style={styles.textMD}>: {type == 'Electric' ? dataUnit.avg_electric : dataUnit.avg_water}</Text>
          </View>

        </View>

        <View style={styles.box}>
          <View style={styles.row}>
            <Text style={[styles.textLG, { width: "90%" }]}>History Meteran</Text>
            <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
              <Ionicons name={showHistory ? 'ios-caret-up' : 'ios-caret-down'} size={20} style={{color: 'darkorange'}}></Ionicons>
            </TouchableOpacity>
            
          </View>
        </View>
        {showHistory &&
          listHistory.map((v, k) => {

            return <View key={k} style={styles.box}>
                <Text style={styles.textTimer}>{v.bulan_text} <Text style={{fontSize:9}}>{v.tahun}</Text></Text>
                <View style={styles.row}>
                  <Text style={[styles.textMD, { width: "30%" }]}>Tanggal Input</Text>
                  <Text style={styles.textMD}>: {v.tanggalinput}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.textMD, { width: "30%" }]}>Petugas</Text>
                  <Text style={styles.textMD}>: {v.petugas}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.textMD, { width: "30%" }]}>Angka Meteran</Text>
                  <Text style={styles.textMD}>: {v.meteran}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.textMD, { width: "30%" }]}>Pemakaian</Text>
                  <Text style={styles.textMD}>: {v.pemakaian}</Text>
                </View>

              </View>
          })
        }
        <View style={styles.box}>
          <Text style={{ color: 'red', fontStyle: 'italic' }}>Silahkan Input data untuk periode {moment().format('MMM YYYY')}</Text>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Tanggal Input</Text>
            <Text style={styles.textMD}>: {moment().format('DD-MM-YYYY')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Petugas</Text>
            <Text style={styles.textMD}>: {userDetail.data.full_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Meteran</Text>
            <Text style={styles.textMD}>:</Text>
            {/* <TextInput style={styles.input} onChangeText={(text) => handleChange('meteran', text)}></TextInput> */}
            <TextInput style={styles.input} onChangeText={(text) => handleMeteran(text)}></TextInput>
          </View>
          <View style={styles.row}>
            <Text style={[styles.textMD, { width: "30%" }]}>Pemakaian</Text>
            <Text style={styles.textMD}>: {form.pemakaian}</Text>
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={[styles.textMD, { width: "30%" }]}>Gambar</Text>
            <Text style={styles.textMD}>: </Text>
            <RegularImagePicker onTakingImage={onTakingImage} size={150}></RegularImagePicker>
          </View>
          {problemSelected != null &&
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={[styles.textMD, { width: "30%" }]}>Problem</Text>
              <Text style={styles.textMD}>: </Text>            
              <Text style={styles.textMD, {fontWeight: 'bold', fontSize: 16}}>{listProblems[problemSelected].idx} {listProblems[problemSelected].problem}</Text>
              <TouchableOpacity
                onPress={() => {
                  setProblemSelected(null);
                }}
              >
                <Ionicons name={'ios-trash-bin'} size={20} style={{color: '#d1193e'}}></Ionicons>
              </TouchableOpacity>
            </View>
          }
          

        </View>
        <View style={styles.btnRow}>
          <View style={styles.btnContainer}>
            <Button 
              buttonStyle={{width: '50%'}}
              color="#d1193e"
              title="PROBLEM"
              onPress={() => handleProblem()}
            />
          </View>
          <View style={styles.btnContainer}>
            <Button 
              buttonStyle={{width: '50%'}}
              color="#72cc50"
              title="OK"
              // onPress={() => doSubmit()}
              onPress={() => {
                // console.log(problemSelected);
                const xListProblem = problemSelected == null ? 'here' : listProblems[problemSelected].idx;
                // console.log('tes');
                // console.log(xListProblem);
                const noScan = idxNoScan.filter(element => element == xListProblem);
                // console.log(noScan);
                if(noScan.length > 0 || xListProblem !== 'here'){
                  // console.log('submit');
                  doSubmit();
                }else{
                  // console.log('check qr');
                  setModalCheckQr(true);
                }               
              }}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.centeredView}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalProblems}
              onRequestClose={() => {
                setModalProblems(!modalProblems);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  {showProblems && 
                    <View>
                      {listProblems.map((v, key) => {
                        return (
                          <View key={key} style={styles.box}>
                            {problemSelected == key ? (
                              <TouchableOpacity style={styles.btnRadio}>
                                <Image
                                  style={styles.imgRadio}
                                  source={require('../../../assets/radio_checked.png')}
                                />
                                <Text style={styles.labelRadio}>{v.problem}</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  setProblemSelected(key);
                                }}
                                style={styles.btnRadio}>
                                <Image
                                  style={styles.imgRadio}
                                  source={require('../../../assets/radio_unchecked.png')}
                                />
                                <Text style={styles.labelRadio}>{v.problem}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  }
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '60%'}}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalProblems(!modalProblems);
                      }}
                      style={[styles.btnRadio, {backgroundColor: '#9DB300', justifyContent: 'center', alignItems: 'center', padding: 10, marginTop: 10, borderRadius: 5, width: 80}]}>
                      <Text style={{alignSelf: 'center', color: 'white'}}>PILIH</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalProblems(!modalProblems);
                        setProblemSelected(null);
                      }}
                      style={[styles.btnRadio, {backgroundColor: '#d1193e', justifyContent: 'center', alignItems: 'center', padding: 10, marginTop: 10, borderRadius: 5, width: 80}]}>
                      <Text style={{textAlign: 'center', color: 'white'}}>BATAL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalCheckQr}
              onRequestClose={() => {
                setModalCheckQr(!modalCheckQr);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={{padding:2, alignItems:'center', justifyContent:'center'}}>
                    <Text style={{alignItems:'center', justifyContent:'center'}}>Block: {block} - Tower: {tower} - Floor: {floor} - Tipe: {tipe}</Text>
                    <View style={styles.barcodebox}>
                      <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{width: 600, height: 600}}
                      />
                    </View>
                    <Button
                      buttonStyle={{backgroundColor: '#D1193E'}}
                      onPress={() => {
                        setModalCheckQr(!modalCheckQr);
                      }}
                      title="TUTUP" 
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>        
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '33%',
    padding: 2
  },
  input: {
    borderBottomWidth: 2,
    minWidth: 100,
    borderColor: 'lightblue',
    marginLeft: 10
  },
  screen: {
    paddingHorizontal: 10,
    paddingBottom: 340,
    marginTop: 10
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 5,
  },
  button: {
    width: "100%",
    height: 50,
    alignSelf: "center",
  },
  textTimer: {
    marginBottom: 10,
    fontWeight: 'bold', 
    fontSize: 18 
  },
  textLG: {
    fontSize: 18 
  },
  textMD: {
    fontSize: 16 
  },
  box: {
    backgroundColor: 'white', padding: 10, margin: 10, marginBottom: 5, borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  btnRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingBottom: 50
  },
  btnContainer: {
    width: '50%',
    padding: 2
  },

  //radio
  radio: {
    flexDirection: 'row',
  },
  imgRadio: {
    height: 20,
    width: 20,
    marginHorizontal: 5,
  },
  btnRadio: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  labelRadio: {
    fontSize: 18
  },

  // modal
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: '100%',
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    // padding: 35,
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
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18
  },

  //barcode
  
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
    height: '80%',
    overflow: 'hidden',
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: 'tomato',
    marginBottom: 10
  }
});

export default Form;