import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { mix, mixColor } from "react-native-redash";
import { Ionicons } from '@expo/vector-icons';

const size = 30;
const styles = StyleSheet.create({
  container: {
    height: size,
    width: size,
    borderRadius: size / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#525251",
  },
});

interface CheckmarkProps {
    checkmarkProgress: Animated.SharedValue<number>;
}

const Checkmark = ({ checkmarkProgress, size, activeColor }) => {
  const style = useAnimatedStyle(() => ({
    backgroundColor: mixColor(checkmarkProgress.value, "#525251", activeColor || "#1dd909"),
    transform: [{ rotateX: `${mix(checkmarkProgress.value*2, 0, Math.PI)}rad` }],
  }));
  
  let overideContainer = {};
  if(size){
      overideContainer = {
        height: size + 5,
        width: size + 5,
        borderRadius: (size + 5) / 2,
      }
  }

  return (
    <Animated.View style={[styles.container, style, overideContainer]}>
      <Ionicons name="ios-checkmark" style={{color: 'white' }} size={size || 20} ></Ionicons>
    </Animated.View>
  );
};

export default Checkmark;