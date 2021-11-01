
import createDataContext from "./createDataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { navigate } from "../navigationRef";
import jwtDecode from "jwt-decode";
import _ from "lodash";
import axios from "axios";

const catatMeterReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_LIST_CM':
            return { ...state, listCatatMeter: action.payload, loading: false };
        case 'UNITS_FETCH':
          return { ...state, catatMeterUnits: action.payload, loading: false };
        case 'RECORDS_FETCH':
          return { ...state, ...action.payload, loading: false };
        default:
            return state;
    }
};

const processError = (error) => {
    console.log(error);
    if(error.response.status == 401){
        Alert.alert('Authorization Failed', 'Silahkan melakukan login kembali', [
            { 
                text: 'Ok',
                onPress: async () => {
                    await AsyncStorage.removeItem('token');
                    navigate('loginFlow');
                }
            }
        ])
    }
}

const fetchUnits = dispatch => async () => {
    try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const token = await AsyncStorage.getItem('token');
        const userDetail = jwtDecode(token);
        
        let block = userDetail.data.absensi_block || '51022';

        if(block == 'Non Blocks') block = 'non_blocks';

        const response = await axios.get('https://easymovein.id/apieasymovein/reading_qr/get_mkrt_units_all.php?blocks='+ block);

        const data = response.data || {};

        await AsyncStorage.setItem('CM_UNITS', JSON.stringify(data.list_mkrt_unit));
        dispatch({ type: 'UNITS_FETCH', payload: data.list_mkrt_unit });
    } catch (error) {
        processError(error);
        Alert.alert('Error', `No signal, failed to fetch units`);
    }
};

const fetchRecords = dispatch => async () => {
  try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = await AsyncStorage.getItem('token');
      const userDetail = jwtDecode(token);
      
      let block = userDetail.data.absensi_block || '51022';

      if(block == 'Non Blocks') block = 'non_blocks';

      const resElectric = await axios.get('https://easymovein.id/apieasymovein/reading_qr/get_electrics.php?blocks='+ block);
      const resWater = await axios.get('https://easymovein.id/apieasymovein/reading_qr/get_waters.php?blocks='+ block);

      const data = {
        listElectric: resElectric.data.list_electric || [],
        listWater: resWater.data.list_water || [],
      }

      await AsyncStorage.setItem('CM_RECORDS', JSON.stringify(data));
      dispatch({ type: 'RECORDS_FETCH', payload: data });

      const localCM = JSON.parse(await AsyncStorage.getItem('localCM')) || [];
      dispatch({ type: 'SET_LIST_CM', payload: localCM });
  } catch (error) {
      // processError(error);
      Alert.alert('Error', `No signal, failed to fetch records electric / water`);
  }
};

const addCatatMeter = dispatch => async (data) => {
    const localCM = JSON.parse(await AsyncStorage.getItem('localCM')) || [];
    const payload = [ ...localCM, data];
    await AsyncStorage.setItem('localCM', JSON.stringify(payload));

    dispatch({ type: 'SET_LIST_CM', payload})
}

const doPostCatatMeter = dispatch => async (val) => {
    try {
        const localCM = await JSON.parse(await AsyncStorage.getItem('localCM')) || [];
        // const uploadData = await new Promise.all(localCM.map(async header => {
        //     header.listReportUpload = await new Promise.all(header.listReportUpload.map(async detail => {
        //         const base64 = await FileSystem.readAsStringAsync(detail.photo_before || '', { encoding: 'base64' });
        //         detail.photo = base64;
        //         return detail;
        //     }));
        //     return header;
        // }));

        // const res = await easymoveinApi.post('/post_report_v2.php', JSON.stringify(uploadData));
        // const error = _.union(res.data.error);
        // if(res.data.error > 0) return Alert.alert('Error', error.join('\n\n'));

        await AsyncStorage.removeItem('localCM');
    } catch (error) {
        console.log(error);
        processError(error);
        dispatch({ type: 'REPORT_SET_LOADING', payload: false });
    }
};

export const { Provider, Context} = createDataContext(
    catatMeterReducer,
    { doPostCatatMeter, fetchUnits, fetchRecords, addCatatMeter },

    // default state reduce
    { loading: false, catatMeterUnits: [], listElectric: [], listWater: [], listCatatMeter: [] }
)