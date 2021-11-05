import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import { Context as CatatMeterContext } from "../../context/CatatMeterContext";

const TypeList = ({ navigation }) => {
  const { headerTitle, type } = navigation.state.params;
  const { state } = useContext(CatatMeterContext);
  const { catatMeterUnits, loading } = state;

  return (
    <>
      <ScrollView style={styles.screen}>
        <Text style={{ marginBottom: 20, fontSize: 24, fontWeight: 'bold'}}>
          {loading ?  'Loading...' : headerTitle}
        </Text>
      </ScrollView>
    </>
  );
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

export default TypeList;