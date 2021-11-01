import React, { useContext, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import { Timer, getStatusFloor } from "./ScheduleListScreen";
import { NavigationEvents } from "react-navigation";
import { Context as ScheduleContext } from '../context/ScheduleContext';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ReportContext } from '../context/ReportContext';
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckInScreen = ({ navigation }) => {
  const { getCurrentShift } = useContext(ScheduleContext);
  const { state: authState } = useContext(AuthContext);
  const { setCurrentZone } = useContext(ReportContext);
  const { userDetail } = authState;
  const [listCheckIn, setListCheckIn] = useState([]);

  const localToState = async () => {
    const localCheckIn = JSON.parse(await AsyncStorage.getItem('localCheckIn')) || [];
    setListCheckIn(localCheckIn);
  }
  
  const onChooseZone = async (zone) => {
    const hour = moment().format('HH');
    const floorName = userDetail.data.absensi_block + ' - Danru - Zone ' + zone;
    await setCurrentZone({blocks: userDetail.data.absensi_block, tower: 'Danru', floor: 'Danru ' + hour, zone});
    navigation.navigate('CheckInScanner', { zone, headerTitle: floorName })
  }
  // console.log('REPORT LIST ', reportState);
  return (
    <>
      <NavigationEvents 
        onWillFocus={async() => {
          await getCurrentShift();
          await localToState();
        }}
      />
      <ScrollView style={styles.screen}>
        <Timer label={`Next Check-In`} getCurrentShift={getCurrentShift}></Timer>
        <View style={styles.row}>

          {[1,2,3,4].map((zone, key) => {
            let bgFloor = '#000';
            const canAccess = true;
            const isChecked = listCheckIn.find(c => c.zone == zone && moment(c.created_at).format('YYYY-MM-DD HH') == moment().format('YYYY-MM-DD HH'));
            if(canAccess) bgFloor = '#6598eb';
            if(isChecked) bgFloor = '#23db1d';

            return <View key={key} style={styles.container}>
              <Button 
                buttonStyle={{ backgroundColor: `${bgFloor}` }}
                onPress={() => canAccess ? onChooseZone(zone) : null}
                title={zone}
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
    paddingVertical: 10
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
})

export default CheckInScreen;