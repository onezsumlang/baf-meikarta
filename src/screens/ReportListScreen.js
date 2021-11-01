import React, { useContext, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Timer, getStatusFloor } from "./ScheduleListScreen";
import { NavigationEvents } from "react-navigation";
import { Context as ScheduleContext } from '../context/ScheduleContext';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ReportContext } from '../context/ReportContext';
import _ from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReportListScreen = ({ navigation }) => {
  const { state: authState } = useContext(AuthContext);
  const { state: reportState, resetReportScan, setCurrentZone } = useContext(ReportContext);
  const { state, fetchSchedule, fetchSchedulePattern, getCurrentShift, getActiveFloor } = useContext(ScheduleContext);
  const { master_unit, activeFloor, currentShift, schedulePattern } = state;
  const { userDetail } = authState;

  const uniqTower = _.uniq(_.map(master_unit, 'tower')) || [];
  const uniqBlock = _.uniq(_.map(master_unit, 'blocks')) || [];
  const defaultTower = uniqTower[0] || '';
  const defaultBlock = uniqBlock[0] || '';

  const [activeTower, setActiveTower] = useState(defaultTower);
  const [activeBlock, setActiveBlock] = useState(defaultBlock);

  const dataUnit = (master_unit || []).filter(v => v.blocks == activeBlock && v.tower == activeTower);

  return (
    <>
      <NavigationEvents 
        onWillFocus={async() => {
          const serverSchedule = JSON.parse(await AsyncStorage.getItem('serverSchedule')) || [];
          const serverSchedulePattern = JSON.parse(await AsyncStorage.getItem('serverSchedulePattern')) || [];
          if(serverSchedule.length == 0) Alert.alert('Info', 'No schedule, please try to sync');
          await getCurrentShift();
          setActiveTower(defaultTower);
        }}
      />
      <ScrollView style={styles.screen}>
        <Timer getCurrentShift={getCurrentShift}></Timer>
        { dataUnit.length == 0 &&
            <Text style={styles.textBlockName}>No Schedule</Text>
        }
        { dataUnit.length > 0 &&
            <Text style={styles.textBlockName}>{dataUnit[0].blocks} - {dataUnit[0].tower}</Text>
        }
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

          {dataUnit.map((v, key) => {

            const statusFloor = getStatusFloor(v.blocks, v.floor, v.tower);
            let bgFloor = '#000';
            if(statusFloor == 'active') bgFloor = '#6598eb';
            if(statusFloor == 'on progress') bgFloor = '#dfe305';
            if(statusFloor == 'done') bgFloor = '#41db30';

            const canAccess = statusFloor == 'active' || statusFloor == 'on progress';
            
            let nextScreen = 'ReportZone';
            if(v.floor == 'Top' || v.floor == 'Bottom') nextScreen = 'ReportDetail';
            
            const goToNextScreen = async (nextScreen) => {
              const floorName = v.blocks + ' - ' + v.tower + ' - ' + v.floor;
              await setCurrentZone({blocks: v.blocks, tower: v.tower, floor: v.floor, zone: '1'});
              if(canAccess) navigation.navigate(nextScreen, { ...v, headerTitle: floorName, parentScreen: 'Report' });
            }

            return <View key={key} style={styles.container}>
              <Button 
                buttonStyle={{ backgroundColor: `${bgFloor}` }}
                onPress={() => goToNextScreen(nextScreen)}
                title={v.floor}
              />
            </View>
          })}

        </View>
      </ScrollView>
      {/* <ScheduleListScreen 
        navigation={navigation} 
        parentComponent={'ReportList'} 
        showActiveOnly={true} 
      /> */}
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingBottom: 50
  },
  button: {
    height: 50,
    alignSelf: "center",
  },
  container: {
    width: '33%',
    padding: 2
  },
  textBlockName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 10
  },
  textTimer: { 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  timer: { alignSelf: 'center', backgroundColor: '#2fc2b8', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
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
})

export default ReportListScreen;