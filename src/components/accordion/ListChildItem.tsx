import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback, Alert } from "react-native";
import Animated, {
  useAnimatedRef,
  measure,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  runOnUI,
} from "react-native-reanimated";
import Checkmark from "./Checkmark";
import * as ImagePicker from 'expo-image-picker';
import * as BarcodeScanner from 'expo-barcode-scanner';
import { useEffect } from "react";
import { Context as ReportContext } from '../../context/ReportContext';
import ContainerImagePicker from './ContainerImagePicker';

export interface ListItem {
  name: string;
  points: string;
}

interface ListItemProps {
  item: ListItem;
  isLast: boolean;
}

const ListChildItem = ({ navigation, category, problem, item, isLast }) => {
    const { state, setCurrentScan } = useContext(ReportContext);
    const { currentReportZone, currentReportScan, listReportScan, listPendingReport } = state;
    const dataScan = (listReportScan || []).find(v => v.category == category && v.problem == problem && v.item_name == item.name);

    const bottomRadius = isLast ? 8 : 0;

    const onClickScan = (itemName) => {
      // const isPending = listPendingReport.find(v => v.blocks == currentReportZone.blocks 
      //   && v.tower == currentReportZone.tower && v.floor == currentReportZone.floor 
      //   && v.zone == currentReportZone.zone && v.category == category && v.problem == problem && v.item_name.toLowerCase() == item.name.toLowerCase()
      // );

      // if(isPending){
      //   Alert.alert('Info', 'Sorry, this item has been reported and not yet resolved');
      //   return
      // }
      setCurrentScan({ ...currentReportZone, category, problem, item_name: itemName })
      navigation.navigate('ReportScanner')
    }

    return (
    <>
      
      <View
          style={[
              styles.container,
              {
              borderBottomLeftRadius: bottomRadius,
              borderBottomRightRadius: bottomRadius,
              },
          ]}
      >
          <Text style={styles.name}>{item.name}</Text>
          <TouchableWithoutFeedback onPress={() => onClickScan(item.name)}>
              <Animated.View style={{marginRight: 30, flexDirection: 'row', alignItems: 'center' }}>
                {/* <Text style={{color: '#6e6e6e'}}>{'Scan '}</Text> */}
                <Ionicons name="ios-scan-circle-sharp" style={{color: '#b8b8b8' }} size={30} ></Ionicons>
              </Animated.View>
          </TouchableWithoutFeedback>
      </View>
      {/* JIKA TIDAK ADA CHILD, MAKA LANGSUNG AMBIL FOTO AJA */}
      {dataScan && dataScan.scan_item.length > 0 && 
        dataScan.scan_item.map((s, key) => (
          <ContainerImagePicker key={key} assetQR={s.qrcode} sku_code={item.sku_code} idAsset={s.id_asset} category={category} problem={problem}/>
        ))
      }
    </>);
};

const LIST_ITEM_HEIGHT = 54;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#b8b8b8",
    height: LIST_ITEM_HEIGHT,
  },
  detail: {
    backgroundColor: "#ebebeb",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderColor: "#f4f4f6",
    minHeight: LIST_ITEM_HEIGHT,
  },
  detailCol: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imagePicker: {
    marginTop: 10,
    width: 70,
    height: 70,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#b8b8b8",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
  },
  pointsContainer: {
    borderRadius: 8,
    backgroundColor: "#44c282",
    padding: 8,
  },
  points: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ListChildItem;
