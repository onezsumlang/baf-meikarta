import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { Context as AuthContext } from '../context/AuthContext';
import { SafeAreaView } from "react-navigation";

const AccountScreen = props => {
    const { signout } = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.screen}>
            <Button
                buttonStyle={styles.buttons} 
                title="Sign Out" 
                onPress={()=> signout()} 
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
    },
    buttons: {
        width: "70%",
        alignSelf: "center",
        backgroundColor: "#e83427"
    },
});

export default AccountScreen;