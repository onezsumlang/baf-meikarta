import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import moment from 'moment';
import { NavigationEvents } from "react-navigation";
import { Context as ScheduleContext } from '../context/ScheduleContext';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ReportContext } from '../context/ReportContext';
import { navigate } from "../navigationRef";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import _ from "lodash";

const ScheduleListScreen = ({ navigation, showActiveOnly, parentComponent }) => {
    const { state: authState } = useContext(AuthContext);
    const { state, fetchSchedule, fetchSchedulePattern, getCurrentShift } = useContext(ScheduleContext);
    const { master_unit, currentShift, schedulePattern } = state;
    const { userDetail } = authState;
    const uniqTower = _.uniq(_.map(master_unit, 'tower')) || [];
    const defaultTower = uniqTower[0] || '';
    const [activeTower, setActiveTower] = useState(defaultTower);
    const dataUnit = (master_unit || []).filter(v => v.tower == activeTower);

    console.log(dataUnit);
    // console.log((userDetail || {}).data);
    // if(Object.keys(currentShift).length == 0){
    //     return (<>
    //         <NavigationEvents onWillFocus={getCurrentShift} />
    //         <View style={styles.no_schedule}>
    //             <Text style={styles.textStyle}>Shift Anda Belum Dimulai</Text>
    //         </View>
    //     </>)
    // }
    return (
    <>
        <NavigationEvents onWillFocus={ async () => {
            const serverSchedule = JSON.parse(await AsyncStorage.getItem('serverSchedule')) || [];
            const serverSchedulePattern = JSON.parse(await AsyncStorage.getItem('serverSchedulePattern')) || [];
            if(serverSchedule.length == 0) Alert.alert('Info', 'No schedule, please try to sync');
            await getCurrentShift();
            setActiveTower(defaultTower);
        }} />
        <ScrollView style={styles.screen}>
            <Timer getCurrentShift={getCurrentShift}/>
            { dataUnit.length > 0 &&
                <Text style={styles.textBlockName}>{dataUnit[0].blocks}</Text>
            }
            <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: "center", }}>
                {
                    uniqTower.map(tower => {
                        let bgFilter = 'white';
                        if(tower == activeTower) bgFilter = 'orange'; 
                        if(tower) return <TouchableOpacity key={tower} onPress={() => setActiveTower(tower)} style={[styles.filterTower, { backgroundColor: `${bgFilter}`}]}><Text style={styles.textTimer}>{tower}</Text></TouchableOpacity >
                    })
                }
            </View>
            
            <View style={styles.header}>
                <View style={[styles.items, { backgroundColor: 'orange' }]}><Text style={styles.textStyle}></Text></View>
                <View style={[styles.items, { backgroundColor: '#ff9cf5' }]}><Text style={styles.textStyle}>Zone 1</Text></View>
                <View style={[styles.items, { backgroundColor: '#ff9cf5' }]}><Text style={styles.textStyle}>Zone 2</Text></View>
                <View style={[styles.items, { backgroundColor: '#ff9cf5' }]}><Text style={styles.textStyle}>Zone 3</Text></View>
                <View style={[styles.items, { backgroundColor: '#ff9cf5' }]}><Text style={styles.textStyle}>Zone 4</Text></View>
            </View>
            <View style={{ paddingBottom: 20 }}>
                {
                    (dataUnit || []).map((datum, idx) => { // This will render a row for each data element.
                        const statusFloor = getStatusFloor(datum.blocks, datum.floor, datum.tower);
                        const floorName = datum.blocks + ' - ' + datum.floor;

                        if(showActiveOnly && statusFloor != 'active') return false;
                        return <RenderRow 
                                    navigation={navigation} 
                                    floorName={floorName} 
                                    block={datum.blocks}
                                    tower={datum.tower}
                                    key={datum.floor} 
                                    floor={datum.floor} 
                                    statusFloor={statusFloor}
                                    parentComponent={parentComponent}
                                />;
                    })
                }
            </View>
            
        </ScrollView>
    </>
    )
};

export const getStatusFloor = (blocks, floor, tower) => {
    const { state: reportState } = useContext(ReportContext);
    const { state: authState } = useContext(AuthContext);
    const { state: scheduleState } = useContext(ScheduleContext);
    const { schedulePattern, currentShift } = scheduleState;
    const { userDetail } = authState;
    const { listLog } = reportState;

    // console.log(userDetail);

    // console.log(schedulePattern);
    // if(!currentShift.start && currentShift.start != 0) return 'future';
    const hourNow = moment().format('H');
    const startDateTime = moment(((userDetail || {}).data || {}).start_datetime).format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = moment(((userDetail || {}).data || {}).end_datetime).format('YYYY-MM-DD HH:mm:ss');
    const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');

    if(dateNow < startDateTime || dateNow > endDateTime) return 'future';

    let job = ((userDetail || {}).data || {}).profile_id;
    
    // if(['21','14','12'].includes(job) === false) job = 12;
    
    // untuk dapat jam ke berapa dr shift tsb, 
    // e.g. jam ke 1 dari shift
    
    const activeBlock = (schedulePattern || []).find(v => v.block == blocks && v.job == job) || {};
    const blockPattern = activeBlock.patterns || [];
    const activeFloor = blockPattern[hourNow] || '';
    const activeIDX = activeFloor.split(',');
    const floorTower = floor + '_' + tower;

    let inactiveFloor = '';
    
    const startHour = parseInt(moment(startDateTime).format('H'));
    let pastHour = parseInt(startHour);
    
    while(pastHour != hourNow){
        const floors = blockPattern[pastHour] || '';
        inactiveFloor += floors + ',';
        pastHour++;
        if(pastHour >= 24) pastHour = 0; // Agar kembali ke 0
        
    }

    const floorSkippedIDX = inactiveFloor.split(',');
    // console.log(activeBlock);
    const canAccess = floorSkippedIDX.includes(floorTower) || activeIDX.includes(floorTower);
    
    const checkZoneReport = listLog.filter(v => v.blocks == blocks && v.floor == floor && v.tower == tower 
                                            && (
                                                moment(v.created_at).format('YYYY-MM-DD HH:mm:ss') >= startDateTime
                                                && moment(v.created_at).format('YYYY-MM-DD HH:mm:ss') <= endDateTime
                                            )
                                    );

    if((floor == 'Top' || floor == 'Bottom') && checkZoneReport.length > 0) return 'done';
    if(checkZoneReport.length > 0 && checkZoneReport.length < 4 && canAccess) return 'on progress';
    if(checkZoneReport.length >= 4) return 'done';
    if(canAccess) return 'active';

    return 'future';

};

const RenderRow = ({ block, tower, floor, statusFloor, parentComponent }) => {
    const { state: reportState } = useContext(ReportContext);
    const { state: authState } = useContext(AuthContext);
    const { listLog } = reportState;
    const { userDetail } = authState;

    const startDateTime = moment(((userDetail || {}).data || {}).start_datetime).format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = moment(((userDetail || {}).data || {}).end_datetime).format('YYYY-MM-DD HH:mm:ss');

    let bgFloor = '#ff9cf5';
    let bgZone = '#000';

    if(statusFloor == 'active') {bgFloor = '#6598eb'; bgZone = '#6598eb';}
    if(statusFloor == 'on progress') {bgFloor = '#dfe305'; bgZone = '#dfe305';}
    if(statusFloor == 'done') {bgFloor = '#41db30'; bgZone = '#41db30';}

    let routeDetail;
    switch(parentComponent) {
        case 'ReportList':
            routeDetail = 'ReportDetail';
            break;
        default:
            routeDetail = 'ScheduleReportDetail';
    };

    return (
        <View style={styles.trow}>
            <View style={[styles.items, { backgroundColor: `${bgFloor}` }]}><Text style={styles.textStyle}>{floor}</Text></View>
            {[1,2,3,4].map((zone, key) => {
                let newBgZone = bgZone;
                const isDone = listLog.find(z => z.zone == zone && z.blocks == block && z.floor == floor && z.tower == tower
                                    && (
                                        moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') >= startDateTime
                                        && moment(z.created_at).format('YYYY-MM-DD HH:mm:ss') <= endDateTime
                                    )
                                );
                
                if(statusFloor == 'on progress' && isDone) newBgZone = '#41db30';
                return <TouchableOpacity key={key} style={[styles.items, { backgroundColor: `${newBgZone}` }]}></TouchableOpacity >
                
            })}
        </View>
    );
}


export const Timer = ({label, getCurrentShift}) => {
    const [timeLeft, setTimeLeft] = useState('--:--');

    // console.log(state);

    useEffect(()=>{
        const intervalId = setInterval(() => {
            const hourNow = moment().format('hh:mm:ss');
            const hourTo = moment().add(1, 'hours').format('hh:00:00')
            const timeNow = moment('1995-11-17 ' + hourNow);
            const timeTo = moment('1995-11-17 ' + hourTo);

            const hourDiff = moment(timeTo.diff(timeNow)).format('mm:ss');
            if(hourDiff == '59:59') getCurrentShift();
            setTimeLeft(hourDiff);
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
    },[])

    return (
        <View style={styles.containerTimer}>
            <Text style={[styles.textTimer, { marginBottom: 5 }]}>{label || 'Next Schedule In'}</Text>
            <View style={styles.timer}>
                <Text style={styles.textTimer}>{timeLeft}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    no_schedule: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    header: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 30,
    },
    trow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 20,
        marginVertical: 5,
    },
    items: {
        width: '19.6%',
        justifyContent: 'center',
        borderRadius: 5
    },
    textStyle: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    textBlockName: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 10
    },
    containerTimer: {
        marginBottom: 30
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
    }
});

export default ScheduleListScreen;