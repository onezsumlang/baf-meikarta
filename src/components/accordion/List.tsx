import React, { useContext } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
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
import { Context as AuthContext } from '../../context/AuthContext';
import Chevron from "./Chevron";
import Item, { ListItem } from "./ListItem";
import Checkmark from "./Checkmark";
import ListChildItem from "./ListChildItem";
import ContainerImagePicker from "./ContainerImagePicker";
import { Context as ReportContext } from '../../context/ReportContext';

export interface List {
  name: string;
  items: ListItem[];
}

interface ListProps {
  list: List;
}

const List = ({ navigation, list, category, onPressCheckList }) => {
  const { state } = useContext(AuthContext);
  const { userDetail } = state;
  const profileID = userDetail.data.profile_id;
  
  const aref = useAnimatedRef<View>();
  const arefChild = useAnimatedRef<View>();
  const open = useSharedValue(false);
  const checkmark = useSharedValue(false);

  const progress = useDerivedValue(() => 
    open.value ? withSpring(1) : withTiming(0)
  );
  const checkmarkProgress = useDerivedValue(() => 
    checkmark.value ? withSpring(1) : withTiming(0)
  );

  const height = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: progress.value === 0 ? 8 : 0,
    borderBottomRightRadius: progress.value === 0 ? 8 : 0,
  }));
  const style = useAnimatedStyle(() => ({
    // minHeight: height.value * progress.value + 1,
    // height: progress.value === 0 ? 0 : '100%',
    display: progress.value === 0 ? 'none':'flex',
    // opacity: progress.value === 0 ? 0 : 1,
  }));

  return (
    <>
        <Animated.View style={[styles.container, headerStyle]}>
          <Text style={styles.title}>{list.title}</Text>
          <View style={styles.groupBtn}>
            {/* <View style={styles.checkmarkContainer}>
              <Ionicons name="ios-checkmark" size={20} style={styles.checkmark} ></Ionicons>
            </View> */}
            <TouchableWithoutFeedback
              onPress={() => {
                checkmark.value = !checkmark.value;
                open.value = false;
                onPressCheckList({ category, checkmark: true });
              }}
            >
              <Animated.View style={{marginRight: 30}}>
                {(() => {
                  if((profileID == 28 || profileID == 37) && (list.sku_code == '4' || list.sku_code == '21')){
                    return <></>;
                  }
                  return <Checkmark {...{ checkmarkProgress }} size={20} activeColor={null}/>;
                })()}
              </Animated.View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                runOnUI(() => {
                  "worklet";
                  height.value = measure(aref).height;
                })();
                
                open.value = !open.value;
                checkmark.value = false;
                onPressCheckList({ category, checkmark: false });
              }}
            >
              <Animated.View>
                {(() => {
                  if((profileID == 28 || profileID == 37) && (list.sku_code == '4' || list.sku_code == '21')){
                    return <Checkmark {...{ checkmarkProgress: progress }} size={20} activeColor={null}/>
                  }
                  return <Chevron {...{ progress }} />
                })()}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </Animated.View>
      <Animated.View style={[styles.items, style]}>
        <View
          ref={aref}
          onLayout={({
            nativeEvent: {
              layout: { height: h },
            },
          }) => console.log('')}
        >

          {/* JIKA TIDAK ADA CHILD, MAKA LANGSUNG AMBIL FOTO AJA */}
          {list.questions.length == 0 && 
            <ContainerImagePicker assetQR={null} idAsset={null} sku_code={list.sku_code} category={list.title} problem={null}/>
          }

          {/* JIKA ADA CHILD, TAMPILKAN ITEM UNTUK DI SCAN */}
          {list.questions.map((question, key) => (
            <Item
              navigation={navigation}
              key={key}
              isLast={key === list.questions.length - 1}
              category={list.title}
              {...{ question }}
            />
          ))}
        </View>
      </Animated.View>
    </>
  );
};


const LIST_ITEM_HEIGHT = 54;
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  items: {
    overflow: "hidden",
  },
  checkmarkContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#525251',
    height: 30,
    width: 30,
    borderRadius: 30 / 2,
    marginRight: 30
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default List;
