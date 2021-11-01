import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";

const UnitList = ({ navigation }) => {
  const { headerTitle, type } = navigation.state.params;
  const { state } = useContext(CatatMeterContext);
  const { catatMeterUnits, loading } = state;

  const uniqTower = _.sortBy(_.uniq(_.map(catatMeterUnits, 'tower'))) || [];
  const uniqBlock = _.sortBy(_.uniq(_.map(catatMeterUnits, 'blocks'))) || [];
  
  const defaultTower = uniqTower[0] || '';
  const defaultBlock = uniqBlock[0] || '';

  const [activeTower, setActiveTower] = useState(defaultTower);
  const [activeBlock, setActiveBlock] = useState(defaultBlock);

  const filteredUnits = catatMeterUnits.filter(v => v.block = activeBlock && v.tower == activeTower);
  const uniqFloor = _.sortBy(_.uniq(_.map(filteredUnits, 'floor'))) || [];

  useEffect(() => {
    const getLocalCM = async () => {
      const localCM = JSON.parse(await AsyncStorage.getItem('localCM'));
    }
    getLocalCM();
  }, []);

  const checkStatus = (floor) => {
    const notDone_Water = catatMeterUnits.filter(v => v.ho == 1 && v.floor == floor && v.water != 2);
    const notDone_Electric = catatMeterUnits.filter(v => v.ho == 1 && v.floor == floor && v.electric != 2);

    return type == 'Water' ? notDone_Water.length == 0 : notDone_Electric.length == 0;
  }

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
          const isDone = checkStatus(v);
          let bgFloor = isDone ? '#548235' : '#f7be14';

          return <View key={key} style={styles.container}>
            <Button 
              buttonStyle={{ backgroundColor: `${bgFloor}` }}
              onPress={() => navigation.navigate('CM_CheckQR', { type, block: activeBlock, floor: v })}
              title={v}
            />
          </View>
          })}
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
  }
});

export default UnitList;