import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
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
import ContainerImagePicker from './ContainerImagePicker';
import ListChildItem from "./ListChildItem";

const LIST_ITEM_HEIGHT = 54;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffd6d6",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#f4f4f6",
    height: LIST_ITEM_HEIGHT,
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
  items: {
    overflow: "hidden",
  },
});

export interface ListItem {
  name: string;
  points: string;
}

interface ListItemProps {
  item: ListItem;
  isLast: boolean;
}

const ListItem = ({ navigation, category, question, isLast }) => {
  const aref = useAnimatedRef<View>();
  const bottomRadius = isLast ? 8 : 0;
  const checkmark = useSharedValue(false);
  const checkmarkProgress = useDerivedValue(() => 
    checkmark.value ? withSpring(1) : withTiming(0)
  );

  const height = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: checkmarkProgress.value === 0 ? 8 : 0,
    borderBottomRightRadius: checkmarkProgress.value === 0 ? 8 : 0,
  }));
  const style = useAnimatedStyle(() => ({
    // height: height.value * checkmarkProgress.value + 1,
    // opacity: checkmarkProgress.value === 0 ? 0 : 1,
    display: checkmarkProgress.value === 0 ? 'none':'flex',
  }));

  return (<>
      <TouchableWithoutFeedback
        onPress={() => {
          // runOnUI(() => {
          //   "worklet";
          //   height.value = measure(aref).height;
          // })();
          
          checkmark.value = !checkmark.value;
        }}
      >
      <Animated.View
        style={[
          styles.container,
          {
            borderBottomLeftRadius: bottomRadius,
            borderBottomRightRadius: bottomRadius,
          },
        ]}
      >
        
          <Animated.View style={{marginRight: 30}}>
            <Checkmark {...{ checkmarkProgress }} size={15} activeColor={'#349ceb'}/>
          </Animated.View>
        <Text style={styles.name}>{question.label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
    <Animated.View style={[styles.items, style]}>
      <View
        ref={aref}
        onLayout={({
            nativeEvent: {
            layout: { height: h },
            },
        }) => console.log()}
      >

      {/* JIKA TIDAK ADA CHILD, MAKA LANGSUNG AMBIL FOTO AJA */}
      {question.items.length == 0 && 
        <ContainerImagePicker assetQR={null} idAsset={null} category={category} problem={question.label} sku_code={question.sku_code}/>
      }

      {/* JIKA ADA CHILD, TAMPILKAN ITEM UNTUK DI SCAN */}
      {(question.items || []).map((item, key) => (
          <ListChildItem
            navigation={navigation}
            key={key}
            isLast={key === question.items.length - 1}
            category={category}
            problem={question.label}
            {...{ item }}
          />
      ))}
      </View>
    </Animated.View>
  </>);
};

export default ListItem;
