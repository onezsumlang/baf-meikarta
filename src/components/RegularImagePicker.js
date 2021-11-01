import React, { useContext, useState } from "react";
import { Alert, Image, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Text } from "react-native-elements";
import Animated from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Context as ReportContext } from '../context/ReportContext';

const RegularImagePicker = ({ idReport, size, onTakingImage }) => {
    const { state, addUploadItem } = useContext(ReportContext);
    const { listReportUpload } = state;

    const [pickedImage, setPickedImage] = useState();
    const [uploadItem, setUploadItem] = useState({
        idReport,
        photo: ''
    });
    
    const afterTakingImage = (data) => {
        onTakingImage(data);
        // addUploadItem(data);
        // addReportItem({ ...currentReportZone, data });
      }

    const takeImageHandler = async () => {
        try {
            const image = await ImagePicker.launchCameraAsync({
                aspect: [16, 9],
                quality: 0.5
            });

            if(image.cancelled) return;

            const permission = await MediaLibrary.requestPermissionsAsync();
            if (!permission.granted) throw 'Need Storage permission to save file';

            const asset = await MediaLibrary.createAssetAsync(image.uri);
            MediaLibrary.createAlbumAsync('BAF Meikarta', asset, true)
            .then((res) => {
                console.log('File Saved Successfully!');
                afterTakingImage({ ...uploadItem, photo: asset.uri });
                setPickedImage(asset.uri);
            })
            .catch((error) => {
                console.log('Error In Saving File!', error);
            });
        } catch (error) {
            console.log(error);
            Alert.alert(
                'Oopss..',
                error,
                [ { text: 'Ok' } ]
            )
        }
    };
    
    return (<>
          <View style={[styles.detail]}>
              
              <View style={styles.detailCol}>
                  {pickedImage &&
                  <TouchableWithoutFeedback onPress={takeImageHandler}>
                    <View style={styles.imagePicker}>
                        <Image style={{ width: size, height: size }} source={{ uri: pickedImage }}></Image>
                    </View>
                  </TouchableWithoutFeedback>
                  }
                  {!pickedImage &&
                    <TouchableWithoutFeedback onPress={takeImageHandler}>
                        <View style={[styles.imagePicker, { width: size, height: size}]}>
                            <Ionicons name="ios-add-outline" style={{color: '#b8b8b8' }} size={50} ></Ionicons>
                        </View>
                    </TouchableWithoutFeedback>
                  }
              </View>
          </View>
    </>)
}
const styles = StyleSheet.create({
    header: {
        backgroundColor: '#b8b8b8',
        paddingVertical: 8,
        paddingHorizontal: 30,
    },
    detail: {
        backgroundColor: "#ebebeb",
        flexDirection: "row",
        padding: 5,
        borderBottomWidth: 1,
        borderColor: "#f4f4f6",
    },
    detailCol: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    imagePicker: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#b8b8b8",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default RegularImagePicker;