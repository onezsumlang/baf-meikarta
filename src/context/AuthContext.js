import createDataContext from "./createDataContext";
import easymoveinApi from "../api/easymovein";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from "../navigationRef";
import jwtDecode from "jwt-decode";

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_CLEAR_ERROR':
            return { ...state, errorMessage: '' };
        case 'AUTH_ERROR':
            return { ...state, errorMessage: action.payload };
        case 'AUTH_SIGNIN':
            return { errorMessage: '', token: action.payload };
        case 'AUTH_SET_USERS':
            return { errorMessage: '', userDetail: action.payload };
        case 'AUTH_SIGNOUT':
            return { token: null, errorMessage: '' };
        default:
            return state;
    }
};

const tryLocalSignin = dispatch => async () => {
    const token = await AsyncStorage.getItem('token');
    if(token){
        const userDetail = jwtDecode(token);

        dispatch({ type: 'AUTH_SIGNIN', payload: token });
        dispatch({ type: 'AUTH_SET_USERS', payload: userDetail});
        navigate('Home');
    } else {
        navigate('Signin');
    }
    
}

const clearError = (dispatch) => () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
}

const signin = (dispatch) => async ({ email, password }, callback) => {
    try {
        console.log('signing in...');
        clearError();
        email = email.toLowerCase();
        const response = await easymoveinApi.post('/login.php', { email, password }, { timeout: 30000 }); 
        // console.log(response);
        if(!response.data.status) throw new Error(response.data.message);

        await AsyncStorage.setItem('token', response.data.token);
        const userDetail = jwtDecode(response.data.token); 
    
        dispatch({ type: 'AUTH_SIGNIN', payload: response.data.token});
        dispatch({ type: 'AUTH_SET_USERS', payload: userDetail});
        
        // navigate to main flow -> App.js
        navigate('Home');
    } catch (error) {
        // console.log(error)
        dispatch({ type: 'AUTH_ERROR', payload: error.message});
    }
};

const signout = (dispatch) => async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('serverSchedule');
    dispatch({ type: 'AUTH_SIGNOUT' });
    navigate('loginFlow');
};

export const { Provider, Context} = createDataContext(
    authReducer,
    { signin, signout, clearError, tryLocalSignin },
    { token: null, errorMessage: '', userDetail: {} }
)