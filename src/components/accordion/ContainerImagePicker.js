import React, { useContext, useState } from "react";
import { Alert, Image, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Text } from "react-native-elements";
import Animated from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Context as ReportContext } from '../../context/ReportContext';
import { TextInput } from "react-native-gesture-handler";
import Textarea from 'react-native-textarea';

const ContainerImagePicker = ({category, problem, idAsset, assetQR, sku_code }) => {
    const { state, addUploadItem, removeUploadItem } = useContext(ReportContext);
    const { listReportUpload } = state;

    const [detail, setDetail] = useState('');
    const [pickedImage, setPickedImage] = useState();
    const [uploadItem, setUploadItem] = useState({
        category: category.trim(),
        problem,
        id_asset: idAsset,
        sku_code,
        qrcode: assetQR
    });
    
    const afterTakingImage = (data) => {
        addUploadItem(data);
        // addReportItem({ ...currentReportZone, data });
    }

    const onChangeDetail = (text) => {
        setDetail(text);
        addUploadItem({ ...uploadItem, description: text });
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
                setUploadItem({ ...uploadItem, photo_before: asset.uri });
                afterTakingImage({ ...uploadItem, photo_before: asset.uri });
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

    //   const fileName = image.uri.split('/').pop();
    //   const newPath = FileSystem.documentDirectory + fileName;
    //   try {
    //       await FileSystem.moveAsync({
    //           from: image.uri,
    //           to: newPath
    //       });
    //       setPickedImage(newPath);
    //       console.log('MASOK', image)
    //       console.log('MASOK', fileName, newPath)
    //   } catch (error) {
    //       console.log(error);
    //       throw error;
    //   }
    };
    
    return (<>
          {assetQR && 
            <Text style={styles.header}>{assetQR || ''}</Text>
          }
          <Animated.View style={[styles.detail]}>
              
              <View style={styles.detailCol}>
                  <Text>{'Foto'}</Text>
                  {pickedImage &&
                  <TouchableWithoutFeedback onPress={takeImageHandler}>
                    <View style={styles.imagePicker}>
                        <Image style={{ width: 70, height: 70 }} source={{ uri: pickedImage }}></Image>
                    </View>
                  </TouchableWithoutFeedback>
                  }
                  {!pickedImage &&
                    <TouchableWithoutFeedback onPress={takeImageHandler}>
                        <View style={styles.imagePicker}>
                            <Ionicons name="ios-add-outline" style={{color: '#b8b8b8' }} size={50} ></Ionicons>
                        </View>
                    </TouchableWithoutFeedback>
                  }
              </View>
              <View style={styles.detailCol}>
                <Textarea
                    containerStyle={styles.input}
                    onChangeText={(text) => onChangeDetail(text)}
                    defaultValue={detail}
                    maxLength={250}
                    underlineColorAndroid={'transparent'}
                />
                  {/* <Text>{'Status'}</Text> */}
              </View>
          </Animated.View>
    </>)
}

const LIST_ITEM_HEIGHT = 54;
const styles = StyleSheet.create({
    header: {
        backgroundColor: '#b8b8b8',
        paddingVertical: 8,
        paddingHorizontal: 30,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth:1,
        marginHorizontal:10,
        borderRadius:5,
        width: 150,
        height: 100
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
});

export default ContainerImagePicker;