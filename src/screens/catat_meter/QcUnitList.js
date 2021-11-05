import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from "react-native";
import { Button } from "react-native-elements";
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";

const QcUnitList = ({ navigation }) => {
  const { headerTitle, type } = navigation.state.params;
  const { state } = useContext(CatatMeterContext);
  const { catatMeterUnits, listElectric, listWater, listProblem, loading } = state;
  const listData = type == 'Electric' ? listElectric : listWater;

  // modal for unit type
  const [modalUnitType, setModalUnitType] = useState(false);

  const uniqTower = _.sortBy(_.uniq(_.map(catatMeterUnits, 'tower'))) || [];
  const uniqBlock = _.sortBy(_.uniq(_.map(catatMeterUnits, 'blocks'))) || [];
  
  const defaultTower = uniqTower[0] || '';
  const defaultBlock = uniqBlock[0] || '';

  const [activeTower, setActiveTower] = useState(defaultTower);
  const [activeBlock, setActiveBlock] = useState(defaultBlock);

  const filteredUnits = catatMeterUnits.filter(v => v.block = activeBlock && v.tower == activeTower);
  const uniqFloor = _.sortBy(_.uniq(_.map(filteredUnits, 'floor'))) || [];

  const defaultFloor = uniqFloor[0] || '';
  const [activeFloor, setActiveFloor] = useState(defaultFloor);

  const filteredUnits2 = catatMeterUnits.filter(v => v.block = activeBlock && v.tower == activeTower && v.floor == activeFloor);
  const uniqType = _.sortBy(_.uniq(_.map(filteredUnits2, 'tipe'))) || [];

  useEffect(() => {
    const getLocalCM = async () => {
      const localCM = JSON.parse(await AsyncStorage.getItem('localCM'));
    }
    getLocalCM();
  }, []);

  const handleFloor = (v) => {
    setActiveFloor(v);
    setModalUnitType(true);
  }

  const checkStatusFloor = (floor) => {
    const notDone_Water = catatMeterUnits.filter(v => v.ho == 1 && v.floor == floor && v.water != 2);
    const notDone_Electric = catatMeterUnits.filter(v => v.ho == 1 && v.floor == floor && v.electric != 2);

    return type == 'Water' ? notDone_Water.length == 0 : notDone_Electric.length == 0;
  }

  const checkStatusType = (type) => {
    const notDone_Water = catatMeterUnits.filter(v => v.ho == 1 && v.floor == activeFloor && v.tipe == type && v.water != 2);
    const notDone_Electric = catatMeterUnits.filter(v => v.ho == 1 && v.floor == activeFloor && v.tipe == type && v.electric != 2);

    return type == 'Water' ? notDone_Water.length == 0 : notDone_Electric.length == 0;
  }

  const handleTipe = (tipe) => {
    const labelUnitCode = activeBlock+'-'+activeTower+'-'+activeFloor+'-'+activeFloor+tipe;

    const labelField = type == 'Electric' ? 'E' : 'A';
    const field = type == 'Electric' ? 'electric_id':'water_id';

    const fieldProblem = type == 'Electric' ? 'electric' : 'water';

    const labelFieldCode = activeBlock+'-'+activeTower+'-'+activeFloor+tipe+'-'+labelField;
    setModalUnitType(!modalUnitType);
    const findUnit = catatMeterUnits.filter(v => v[field] == labelFieldCode && v.blocks == activeBlock && v.tower == activeTower && v.floor == activeFloor && v.tipe == tipe);
    const history = listData.filter(v => v.unit_code == labelUnitCode);

    const problems = listProblem.filter(v => v.meter == fieldProblem);

    // console.log(problems);

    navigation.navigate('CM_FormQc', { detailUnit: findUnit, history, type, problems });
  }

  // console.log(catatMeterUnits);

  return (
    <>
      <ScrollView style={styles.screen}>
        <Text style={{ marginBottom: 20, fontSize: 24, fontWeight: 'bold'}}>
          {loading ?  'Loading...' : headerTitle}
        </Text>
        <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: "center", }}>
            {
                uniqBlock.map(block => {
                    let bgFilter = 'white';
                    if(block == activeBlock) bgFilter = '#3f77d9'; 
                    if(block) return <TouchableOpacity key={block} onPress={() => setActiveBlock(block)} style={[styles.filterBlock, { backgroundColor: `${bgFilter}`}]}><Text style={styles.textTimer}>{block}</Text></TouchableOpacity >
                })
            }
        </View>
        <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: "center", }}>
            {
                uniqTower.map(tower => {
                    let bgFilter = 'white';
                    if(tower == activeTower) bgFilter = 'orange'; 
                    if(tower) return <TouchableOpacity key={tower} onPress={() => setActiveTower(tower)} style={[styles.filterTower, { backgroundColor: `${bgFilter}`}]}><Text style={styles.textTimer}>{tower}</Text></TouchableOpacity >
                })
            }
        </View>
        <View style={styles.row}>
        {uniqFloor.map((v, key) => {
          const isDone = checkStatusFloor(v);
          let bgFloor = isDone ? '#000000' : '#d1193e';

          return <View key={key} style={styles.container}>
            <Button 
              buttonStyle={{ backgroundColor: `${bgFloor}` }}
              onPress={() => handleFloor(v)}
              // onPress={() => navigation.navigate('CM_CheckQR', { type, block: activeBlock, floor: v })}
              title={v}
            />
          </View>
          })}
        </View>
        
        <View style={styles.row}>
          <View style={styles.centeredView}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalUnitType}
              onRequestClose={() => {
                setModalUnitType(!modalUnitType);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>{activeBlock} - {activeTower}</Text>
                  <Text style={styles.modalText}>PILIH TIPE DI LANTAI <Text style={{fontWeight: 'bold'}}>{activeFloor}</Text></Text>
                  <View style={styles.row}>
                  {
                    uniqType.map((v, key) => {
                      const isDone = checkStatusType(v);
                      let bgFloor = isDone ? '#9DB300' : '#8ecae6';

                      return <View key={key} style={styles.container}>
                        <Button
                          buttonStyle={{backgroundColor: `${bgFloor}`}}
                          title={v} 
                          onPress={() => handleTipe(v)}
                        />
                      </View>
                    })
                  }
                  </View>
                  <Button
                    buttonStyle={{backgroundColor: '#D1193E'}}
                    onPress={() => {
                      setModalUnitType(!modalUnitType);
                    }}
                    title="TUTUP" 
                  />
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
  screen: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingBottom: 50
  },
  button: {
    width: "100%",
    height: 50,
    alignSelf: "center",
  },
  textTimer: { 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  filterTower: {
    backgroundColor: 'white',
    borderColor: 'orange',
    borderWidth: 1,
    alignSelf: 'center', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 5,
    width: 70,
    marginHorizontal: 5
  },
  filterBlock: {
    backgroundColor: 'white',
    borderColor: '#3f77d9',
    borderWidth: 1,
    alignSelf: 'center', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 5,
    width: 70,
    marginHorizontal: 5
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
  }
});

export default QcUnitList;