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

interface ChevronProps {
  progress: Animated.SharedValue<number>;
}

const Chevron = ({ progress }: ChevronProps) => {
  const style = useAnimatedStyle(() => ({
    backgroundColor: mixColor(progress.value, "#525251", "#e45645"),
    transform: [{ rotateZ: `${mix(progress.value, 0, Math.PI)}rad` }],
  }));
  return (
    <Animated.View style={[styles.container, style]}>
      <Ionicons name="ios-close" style={{color: 'white' }} size={20} ></Ionicons>
    </Animated.View>
  );
};

export default Chevron;
