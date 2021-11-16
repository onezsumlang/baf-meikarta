import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import {Button, Badge} from "react-native-elements";
import { NavigationEvents, SafeAreaView } from "react-navigation";
import { Context as AuthContext } from "../../context/AuthContext";
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";
import moment from "moment";
import _ from "lodash";


const MainMenu = ({ navigation }) => {
    const { state: authState } = useContext(AuthContext);
    const { state } = useContext(CatatMeterContext);
    const { listSchedule } = state;
    const { userDetail } = authState;
    const profileID = ((userDetail || {}).data || {}).profile_id;

    const currentDate = moment().format('YYYY-MM-DD');

    const QC_WATER_Sched = listSchedule.filter(v => v.type == 'QC_WATER' && v.schedule_date == currentDate);
    const QC_ELECTRIC_Sched = listSchedule.filter(v => v.type == 'QC_ELECTRIC' && v.schedule_date == currentDate);
    const CM_WATER_Sched = listSchedule.filter(v => v.type == 'CM_WATER' && v.schedule_date == currentDate);
    const CM_ELECTRIC_Sched = listSchedule.filter(v => v.type == 'CM_ELECTRIC' && v.schedule_date == currentDate);

    return (
    <>
        <NavigationEvents />
        {/* <SafeAreaView> */}
            <SafeAreaView style={styles.screen}>
                <View style={styles.row}>
                    {QC_WATER_Sched.length > 0 &&
                        <View style={styles.container}>                            
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#fff' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '70%' }}
                                title="METER AIR QC" 
                                color
                                onPress={()=> navigation.navigate('CM_QcUnitList', { headerTitle: 'METER AIR READING QC', type: 'Water' })} 
                            />                            
                        </View>
                    }

                    {QC_WATER_Sched.length == 0 && 
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#ccc' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '100%' }}
                                title="METER AIR QC NO SCHEDULE" 
                                color
                            />  
                        </View>
                    }

                    {CM_WATER_Sched.length > 0 &&
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#fff' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '70%' }}
                                title="METER AIR READING" 
                                color
                                onPress={()=> navigation.navigate('CM_UnitList', { headerTitle: 'METER AIR READING', type: 'Water' })} 
                            />
                        </View>
                    }

                    {CM_WATER_Sched.length == 0 && 
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#ccc' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '100%' }}
                                title="METER AIR READING NO SCHEDULE" 
                                color
                            />  
                        </View>
                    }

                    {QC_ELECTRIC_Sched.length > 0 &&
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#fff' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '70%' }}
                                title="METER LISTRIK QC" 
                                onPress={()=> navigation.navigate('CM_QcUnitList', { headerTitle: 'METER LISTRIK READING QC', type: 'Electric' })} 
                            />
                        </View>
                    }

                    {QC_ELECTRIC_Sched.length == 0 && 
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#ccc' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '100%' }}
                                title="METER LISTRIK QC NO SCHEDULE" 
                                color
                            />  
                        </View>
                    }

                    {CM_ELECTRIC_Sched.length > 0 &&
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#fff' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '70%' }}
                                title="METER LISTRIK READING" 
                                onPress={()=> navigation.navigate('CM_UnitList', { headerTitle: 'METER LISTRIK READING', type: 'Electric' })} 
                            />
                        </View>
                    }

                    {CM_ELECTRIC_Sched.length == 0 && 
                        <View style={styles.container}>
                            <Button 
                                buttonStyle={[styles.buttonChild, { backgroundColor: '#ccc' }]}
                                titleStyle={{ color: 'black', fontWeight: 'bold', width: '100%' }}
                                title="METER LISTRIK READING NO SCHEDULE" 
                                color
                            />  
                        </View>
                    }
                </View>
            </SafeAreaView>
            
        {/* </SafeAreaView> */}
        
    </>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 100,
        paddingVertical: 20,
        paddingHorizontal: 10,
        color: "black"
    },
    button: {
        width: "100%",
        height: 50,
        alignSelf: "center",
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingVertical: 10
    },
    container: {
        width: '47%',
        backgroundColor: 'white', margin: 5,
        shadowColor: "#000",
        borderRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    },
    buttonChild: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        height: 80,
        margin: 5,
    },
    version:{
        fontSize: 11,
        padding: 6,
    },
    status:{
        fontSize: 11,
        padding: 6,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 6
    },
    headerButton: {
        marginHorizontal: 8,
        marginTop: 8
    },
    badgeStyle: {
        position: 'absolute',
        top: -4,
        right: -4,
    },
    box: {
        backgroundColor: 'white', padding: 10, margin: 10, marginBottom: 0, borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    }
});

export default MainMenu;