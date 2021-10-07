import React, { useEffect, useState } from 'react'
import { Container, Content } from 'native-base'
import { Text, Image, View, StyleSheet, TouchableOpacity } from 'react-native'
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen'
import CustomInput from '../../Components/CustomInput'
import { CheckBox } from 'react-native-elements'
import CustomButton from '../../Components/CustomButton'
import { CustomFont } from '../../Constants/CustomFont'
import { CustomColor } from '../../Constants/CustomColor'
import { LoaderIndicator } from '../../Components/LoaderContext'
import { removeItem, retrieveItem, showToast, storeItem } from '../Validator'
import { Api } from '../../Api'
import { useDispatch } from 'react-redux'
import { login_reducer } from '../../Redux/Login'

const Login = ({ navigation }) => {
    let dispatch = useDispatch()
    const loader = React.useContext(LoaderIndicator)
    const [checked, setChecked] = useState(false)
    const [data, setData] = useState({
        email: '',
        password: ''
    })

    useEffect(() => {
        retrieveItem('remember').then((_data) => {
            if (_data) {
                let x = { ...data }
                x.email = _data.email
                x.password = _data.password
                setData(x)
                setChecked(true)
            }
            else {
                let x = { ...data }
                x.email = ''
                x.password = ''
                setData(x)
                setChecked(false)
            }
        })
    }, [])

    // on_Remember
    const on_Remember = async () => {
        if (checked == false) {
            let _data = {
                email: data.email,
                password: data.password
            }
            await storeItem('remember', _data)
            setChecked(true)
        }
        else {
            await removeItem('remember')
            setChecked(false)
        }
    }


    // on_Change
    const on_Change = async (text, type) =>  {
        let x = { ...data }
        x[type] = text
        setData(x)
    }

    // on_Login
    const on_Login = async () => {
        loader.toggleLoading(true)
        if (data.email == '') {
            showToast('Enter Your Email', 'default')
            loader.toggleLoading(false)
            return false
        }

        if (data.password == '') {
            showToast('Enter Your Password', 'default')
            loader.toggleLoading(false)
            return false
        }

        let login_data = {
            "email": data.email.toLowerCase(),
            "password": data.password
        }

        let header = {
            "Content-Type": 'application/json'
        }

        let config = {
            type: 'post',
            headers: header,
            data: JSON.stringify(login_data),
            endPoint: 'auth/login'
        }
        
        Api(config).then((response) => {
            if (response.status == 200) {
                showToast(response.message, 'success')
                storeItem('user', response.data)
                dispatch(login_reducer(response.data))
                navigation.navigate('NonAuth')
                if (checked == true) {
                    let _data = {
                        email: data.email,
                        password: data.password
                    }
                    storeItem('remember', _data)
                    setChecked(true)
                }
                loader.toggleLoading(false)
            }
            else {
                showToast(response.message, 'danger')
                loader.toggleLoading(false)
            }
        })
    }

    return (
        <Container >
            <Content>
                <View style={{ alignSelf: 'center', marginTop: 50, width: widthPercentageToDP(80) }}>
                    {/* logo */}
                    <Image source={require('../../Assets/3-logo.png')} style={{ width: widthPercentageToDP(70), height: heightPercentageToDP(20), resizeMode: 'contain', alignSelf: 'center', borderRadius: 20 }} />
                    {/* email */}
                    <CustomInput text={'Email'} placeholder={'Enter your Email'} value={data.email} onChangeText={(text) => on_Change(text, 'email')} />
                    {/* password */}
                    <CustomInput text={'Password'} placeholder={'Enter your password'} secureTextEntry={true} onChangeText={(text) => on_Change(text, 'password')} value={data.password} />
                    {/* remember/forgotpass */}
                    <View style={styles.mainView}>
                        {/* remember */}
                        <View style={styles.rememberView}>
                            <CheckBox
                                checked={checked}
                                onPress={() => on_Remember()}
                                containerStyle={{ width: 20 }}
                                checkedIcon={<Image style={{ height: 24, width: 24, }} source={require('../../Assets/checked.png')} />}
                                uncheckedIcon={<Image style={{ height: 24, width: 24, }} source={require('../../Assets/unchecked.png')} />}
                            />
                            <Text style={styles.rememberTxt}>Remember</Text>
                        </View>
                        {/* forgotpass */}
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={{ fontFamily: CustomFont.Poppins_Regular, fontSize: 15 }}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                    {/* loginButton */}
                    <CustomButton title={'Login'} onPress={() => on_Login()} />
                    {/* registertxt */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: "center" }}>
                        <Text style={styles.signUpTxt}>Don’t have an account ?</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignUp')}>
                            <Text style={[styles.signUpTxt, { color: CustomColor.buttonColor }]}> Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Image */}
                {/* <Image source={require('../../Assets/hill.png')} style={{ width: widthPercentageToDP(100), marginTop: 20, height: heightPercentageToDP(23) }} /> */}
            </Content>
        </Container>
    )
}

export default Login

const styles = StyleSheet.create({
    mainView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rememberView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -15,
    },
    rememberTxt: {
        fontSize: 15,
        fontFamily: CustomFont.Poppins_Regular,
        marginLeft: 10,
    },
    signUpTxt: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: CustomFont.Poppins_Regular,
        color: CustomColor.grey
    }
})
//vhkchcgchggckhhb kvu
