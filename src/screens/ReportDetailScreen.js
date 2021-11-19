import React, { useContext, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import { Button } from "react-native-elements";
import { NavigationEvents } from "react-navigation";
import { Context as ReportContext } from '../context/ReportContext';
import { Context as AuthContext } from '../context/AuthContext';

import List, { List as ListModel } from "../components/accordion/List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";

const ReportDetailScreen = ({ navigation }) => {
  const { state, getReportState, addReportItem } = useContext(ReportContext);
  const { state: authState } = useContext(AuthContext);
  const { currentReportZone, currentReportAsset, listReportScan, listReportUpload, listCategory } = state;
  const { headerTitle } = navigation.state.params;
  const [checkList, setCheckList] = useState([]);

  const profileID = authState.userDetail.data.profile_id;
  // console.log(profileID)

  // console.log('Asset Item', currentReportAsset);
  const validationSubmit = () => {
    if(checkList.length < listCategory.length && profileID != '101'){
      Alert.alert('Info', 'Please complete the form');
      return false;
    }

    let status = true;
    checkList.map(check => {
      if(check.checkmark == false){
        const countScannedItem = _.sum(listReportScan.filter(v => v.category.toLowerCase() == check.category.toLowerCase()).map(v => v.scan_item.length));
        const checkUploadItem = listReportUpload.filter(v => v.category.toLowerCase() == check.category.toLowerCase() && v.id_asset != null);
        const checkUpload = listReportUpload.filter(v => v.category.toLowerCase() == check.category.toLowerCase());

        if(checkUpload.length == 0 || (countScannedItem > 0 && countScannedItem != checkUploadItem.length)){
          Alert.alert('Warning', 'Please complete upload photo on "'+ check.category +'"');
          status = false;
        }
      }
    });

    return status;
  }

  const doSubmit = async (navigation) => {
    console.log(listReportUpload);
    if(validationSubmit() == false) return;
    
    // console.log({ ...currentReportZone, listReportUpload });
    let willUpload = [];
    checkList.map(check => {
      const filterUpload = listReportUpload.filter(v => v.category.toLowerCase() == check.category.toLowerCase());
      if(check.checkmark == false) willUpload = [ ...willUpload, ...filterUpload];
    });
    // console.log(currentReportZone);
    addReportItem({ ...currentReportZone, listReportUpload: willUpload });
    navigation.navigate('Home');
  };

  const onPressCheckList = (data) => {
    const filtered = checkList.filter(v => v.category != data.category);
    setCheckList([ ...filtered, data]);
  }

  return (<>
      <NavigationEvents 
        onWillFocus={async() => {
          await getReportState();
        }}
      />
      <ScrollView style={styles.screen}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>{headerTitle}</Text>
        {
          listCategory.map(list => {
            return <List key={list.title} onPressCheckList={onPressCheckList} navigation={navigation} category={list.title} list={list} />
          })
        }
        {/* <List onPressCheckList={onPressCheckList} navigation={navigation} category={`kebersihan`} list={listKebersihan} />
        <List onPressCheckList={onPressCheckList} navigation={navigation} category={`keamanan`} list={listKeamanan} />
        <List onPressCheckList={onPressCheckList} navigation={navigation} category={`fungsional`} list={listFungsional} /> */}
        <View style={{ marginTop: 20 }}>
          <Button 
              buttonStyle={styles.button}
              title="Submit" 
              onPress={()=> doSubmit(navigation)} 
          />
        </View>
        <View style={{ marginBottom: 40 }}></View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    height: 50,
    alignSelf: "center",
  },
});

export default ReportDetailScreen;