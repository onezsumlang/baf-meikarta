import React, { useContext } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { NavigationEvents } from "react-navigation";
import { Context as ReportContext } from '../context/ReportContext';
import { Context as AuthContext } from '../context/AuthContext';
import moment from 'moment';

const ReportZoneScreen = ({ navigation }) => {
    const { state: authState } = useContext(AuthContext);
    const { state, setCurrentZone, resetReportTemp } = useContext(ReportContext);
    const { block_name, blocks, tower, floor, parentScreen } = navigation.state.params;
    const { currentReportZone, listLog, listComplaint } =  state;
    const { userDetail } = authState;
    const userData = ((userDetail || {}).data || {});

    const startDateTime = moment(((userDetail || {}).data || {}).start_datetime).format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = moment(((userDetail || {}).data || {}).end_datetime).format('YYYY-MM-DD HH:mm:ss');


    const onChooseZone = async (zone) => {
        const isDone = listLog.find(z => z.zone == zone && z.blocks == blocks && z.floor == floor && z.tower == tower
                            && (
                                moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') >= startDateTime
                                && moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') <= endDateTime
                            )
                        );
        if(isDone && parentScreen == 'Report') return;
        const floorName = blocks + ' - ' + tower + ' - ' + floor + ' - Zone ' + zone;
        await setCurrentZone({blocks, tower, floor, zone});
        // navigation.navigate('ReportDetail', { headerTitle: `${floorName}` });

        if(parentScreen == 'Report') navigation.navigate('ReportScannerZone', { headerTitle: `${floorName}`, zone, parentScreen });
        if(parentScreen == 'Resolve') navigation.navigate('ResolveScannerZone', { headerTitle: `${floorName}`, zone, parentScreen });

    };
    const checkZoneStored = (zone) => {
        if(parentScreen == 'Report'){
            const isDone = listLog.find(z => z.zone == zone && z.blocks == blocks && z.floor == floor && z.tower == tower
                                        && (
                                            moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') >= startDateTime
                                            && moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') <= endDateTime
                                        )
                                    );

            if(userData.profile_id == 37 && zone != 4) return "grey";
            if(zone==4) return isDone ? "grey" : "green";
            if(zone==3) return isDone ? "grey" : "blue";
            if(zone==2) return isDone ? "grey" : "#ffcea1";
            if(zone==1) return isDone ? "grey" : "orange";
            
        }

        if(parentScreen == 'Resolve'){
            const anyProblem = listComplaint.filter(z => z.zone == zone && z.blocks == blocks && z.floor == floor && z.tower == tower && z.status == 'REPORTED').length > 0;
        
            if(zone==4) return anyProblem ? "#bd0f0f" : "green";
            if(zone==3) return anyProblem ? "#bd0f0f" : "blue";
            if(zone==2) return anyProblem ? "#bd0f0f" : "#ffcea1";
            if(zone==1) return anyProblem ? "#bd0f0f" : "orange";
        }
    };

    return (<>
        <NavigationEvents 
            onWillFocus={async() => {
                await resetReportTemp();
            }}
        />
        <View style={styles.screen}>
            <Text style={styles.textBlockName}>{blocks} - {tower} - {floor}</Text>
            <View style={styles.zoneOption}>
                <TouchableOpacity onPress={() => onChooseZone(3)} style={{ width: 50, height: 80 }}>
                    <View style={{ width: 50, height: 80, justifyContent: 'center' }}>
                        <Svg width="50" height="80">
                            <Rect
                                x="0"
                                y="0"
                                width="50"
                                height="80"
                                fill={checkZoneStored(3)}
                            />
                        </Svg>
                        <Text style={{ position: 'absolute', left: 3, color: checkZoneStored(3) ? 'white' : '#fff' }}>Zone 3</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 170, height: 50 }} onPress={() => onChooseZone(2)}>
                    <View style={{ width: 170, height: 50, justifyContent: 'center' }}>
                        <Svg width="170" height="50">
                            <Rect
                                x="0"
                                y="0"
                                width="170"
                                height="50"
                                fill={checkZoneStored(2)}
                            />
                        </Svg>
                        <Text style={{ position: 'absolute', left: '50%', color: checkZoneStored(2) ? 'white' : '#000' }}>Zone 2</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 50, height: 80 }} onPress={() => onChooseZone(4)}>
                    <View style={{ width: 50, height: 80, justifyContent: 'center' }}>
                        <Svg width="50" height="80">
                            <Rect
                                x="0"
                                y="0"
                                width="50"
                                height="80"
                                fill={checkZoneStored(4)}
                            />
                            <Text style={{ position: 'absolute', color: checkZoneStored(4) ? 'white' : '#fff', top: 30, left: 3 }}>Zone 4</Text>
                        </Svg>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ left: 169, bottom: 170, width: 50, height: 120 }} onPress={() => onChooseZone(1)}>
                    <View style={{ width: 50, height: 120, justifyContent: 'center' }}>
                        <Svg width="50" height="120">
                            <Rect
                                x="0"
                                y="0"
                                width="50"
                                height="120"
                                fill={checkZoneStored(1)}
                            />
                        </Svg>
                        <Text style={{ position: 'absolute', color: 'white', left: 3 }}>
                            Zone 1
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    </>)
}

const styles = StyleSheet.create({
    screen: {
      paddingVertical: 20,
      paddingHorizontal: 10,
    },
    zoneOption:{
        alignSelf: 'center',
        justifyContent: 'center',
        height: '90%'
    },
    textBlockName: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 22,
      marginBottom: 10
    },
  })

export default ReportZoneScreen;