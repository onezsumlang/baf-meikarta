import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import {Text, Input, Button} from "react-native-elements";
import { Context as AuthContext } from '../context/AuthContext';

const SigninScreen = ({ navigation }) => {
    const { state, signin } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.screen}>
            <Text style={{...styles.mb30, textAlign: "center" }} h3>Sign In BAF</Text>
            <Input 
                label="Email" 
                value={email} 
                onChangeText={setEmail}
                autoCorrect={false}
            />
            <Input 
                secureTextEntry
                label="Password" 
                value={password} 
                onChangeText={setPassword} 
                autoCorrect={false}
            />
            {state.errorMessage ?
                <Text style={styles.errorMessage}>*{state.errorMessage}</Text>
                :
                null
            }
            <Button 
                buttonStyle={styles.buttons}
                title="Sign In"
                onPress={() => signin({ email, password })}
            />
        </View>
    )
};

SigninScreen.navigationOptions = () => {
    return {
      headerShown: false,
    };
  };

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100
    },
    mb30: {
        marginBottom: 30
    },
    buttons: {
        width: "96%",
        alignSelf: "center"
    },
    errorMessage: {
        fontSize: 14,
        color: 'red',
        marginBottom: 10,
        paddingHorizontal: 10
    }
});

export default SigninScreen;