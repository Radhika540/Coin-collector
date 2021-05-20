import React, { useEffect, useState } from 'react'
import { Container, Content, Icon, Item, Picker } from 'native-base'
import { Text, Image, View, StyleSheet } from 'react-native'
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen'
import CustomInput from '../../Components/CustomInput'
import { CheckBox } from 'react-native-elements'
import CustomButton from '../../Components/CustomButton'
import { CustomFont } from '../../Constants/CustomFont'
import { CustomColor } from '../../Constants/CustomColor'
import CountryPicker from 'react-native-country-picker-modal'
import { TouchableOpacity } from 'react-native'
import Loader from '../../Components/Loader'
import { showToast } from '../Validator'
import { Keyboard } from 'react-native'
import { Api } from '../../Api'
import { LoaderIndicator } from '../../Components/LoaderContext'
import csc from 'country-state-city'
import CustomPicker from '../../Components/CustomPicker'

const SignUp = ({ navigation }) => {
    const loader = React.useContext(LoaderIndicator)
    const [visible, onVisibleChange] = useState(false)
    const [country, setCountry] = useState('')
    const [countryCode, setCountryCode] = useState('US')
    const [callingCode, setCallingCode] = useState('1')
    const [withFlag, setWithFlag] = useState(true)
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [city, setCity] = useState('')
    const [state, setState] = useState('')

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        confirmpassword: '',
        phonenumber: '',
        refercode: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    })

    useEffect(() => {
        setUpData()
    }, [])

    const setUpData = () => {
        let countries = csc.getAllCountries()
        let countryData = null
        
        countries.forEach(element => {
            if (element.name == "United States") {
                countryData = element
            }
        });

        let statesData = csc.getStatesOfCountry(countryData.id)
        let citiesData = csc.getCitiesOfState(statesData[0].id)
        setStates([...statesData])
        setCities([...citiesData])
        setState(states[0] ? states[0].name : "")
        setCity(cities[0] ? cities[0].name : "")    
    }

    const onSelect = (country) => {
        setCountryCode(country.cca2)
        setCountry(country)
        setCallingCode(country.callingCode)
    }

    // on_Change
    const on_Change = (text, type) => {
        let x = { ...data }
        x[type] = text

        console.log("x =>", x)
        setData(x)
    }

    // on_signup
    const on_signup = () => {
        loader.toggleLoading(true)
        Keyboard.dismiss()
        if (data.name == '') {
            showToast('Enter Your Name', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.email == '') {
            showToast('Enter Your Email', 'default')
            loader.toggleLoading(false)
            return false
        }
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(data.email) == false) {
            showToast('Valid email is required', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.password == '') {
            showToast('Enter Your Password', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.password.length < 6) {
            showToast('Password Must have length of 6 Elements', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.password != data.confirmpassword) {
            showToast('Password Doesnot Match', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.phonenumber == '') {
            showToast('Enter Your Phone Number', 'default')
            loader.toggleLoading(false)
            return false
        }
        if (data.address == '') {
            showToast('Enter Your Address', 'default')
            loader.toggleLoading(false)
            return false
        }
        let address = {
            address: data.address,
            state: data.state,
            city: data.city,
            zip: data.zip
        }
        let signup_data = {
            "name": data.name,
            "email": data.email.toLowerCase(),
            "countryCode": '+' + callingCode,
            "phoneNumber": data.phonenumber,
            "address": JSON.stringify(address),
            "state": data.state,
            "city": data.city,
            "zipCode": data.zip,
            "password": data.password,
            "referCodeFrom": data.refercode,
        }
        let header = {
            "Content-Type": 'application/json'
        }
        let config = {
            type: 'post',
            headers: header,
            data: JSON.stringify(signup_data),
            endPoint: 'auth/register'
        }

        Api(config).then((response) => {
            if (response.status == 200) {
                showToast(response.message, 'success')
                navigation.navigate('Login')
                loader.toggleLoading(false)
            }
            else {
                showToast(response.message, 'danger')
                loader.toggleLoading(false)
            }
        })
    }

    const onChangeState = (value) => {
        let item = states.find((ite) => ite.name === value)

        console.log("item", item)

        if (item) {
            let citiesData = csc.getCitiesOfState(item.id)
            setCities([...citiesData])
        }
        
        on_Change(item.name, 'state')
    }

    return (
        <Container>
            <Content>
                <View style={{ alignSelf: 'center', marginTop: 50 }}>
                    <View style={{ paddingHorizontal: 25 }}>
                        {/* logo */}
                        <Image source={require('../../Assets/3-logo.png')} style={{ width: widthPercentageToDP(60), height: heightPercentageToDP(15), resizeMode: 'contain', alignSelf: 'center' }} />
                        {/* createAccount */}
                        <Text style={styles.createTxt}>Create Account</Text>
                        {/* name */}
                        <CustomInput text={'Name'} placeholder={'Enter your Name'} value={data.name} onChangeText={(text) => on_Change(text, 'name')} />
                        {/* email */}
                        <CustomInput text={'Email'} placeholder={'Enter your Email'} value={data.email} onChangeText={(text) => on_Change(text, 'email')} />
                        {/* password */}
                        <CustomInput text={'Password'} placeholder={'Enter your Password'} secureTextEntry={true} value={data.password} onChangeText={(text) => on_Change(text, 'password')} />
                        {/* confirm */}
                        <CustomInput text={'Confirm Password'} placeholder={'Enter your Password'} secureTextEntry={true} value={data.confirmpassword} onChangeText={(text) => on_Change(text, 'confirmpassword')} />
                        {/* phone */}
                        <View style={{ flexDirection: 'row', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                onPress={() => onVisibleChange(!visible)}
                                style={styles.pickerView}>
                                <CountryPicker
                                    countryCode={countryCode}
                                    withFlag={withFlag}
                                    onSelect={(country) => onSelect(country)}
                                    visible={visible}
                                />
                                <Text
                                    onPress={() => onVisibleChange(!visible)}
                                    style={{ fontSize: 18 }}>+{callingCode}</Text>
                            </TouchableOpacity>
                            <View style={{ width: '67%' }}>
                                <CustomInput text={'Phone Number'} placeholder={'Phone Number'} keyboardType={'numeric'} value={data.phonenumber} onChangeText={(text) => on_Change(text, 'phonenumber')} />
                            </View>
                        </View>
                        {/* address */}
                        <CustomInput text={'Address'} placeholder={'Enter your address'} value={data.address} onChangeText={(text) => on_Change(text, 'address')} />
                        {/* <CustomInput text={'City'} placeholder={'Enter your city'} value={data.city} onChangeText={(text) => on_Change(text, 'city')} /> */}
                        <CustomPicker
                            data={states}
                            title={'State'}
                            onValueChange={(item) => onChangeState(item)}
                        />
                        <CustomPicker
                            data={cities}
                            title={'City'}
                            onValueChange={(item) => on_Change(item, 'city')}
                        />
                        {/* <CustomInput text={'State'} placeholder={'Enter your state'} value={data.state} onChangeText={(text) => on_Change(text, 'state')} /> */}
                        <CustomInput text={'zip'} placeholder={'Enter your zip'} value={data.zip} onChangeText={(text) => on_Change(text, 'zip')} />
                        {/* refercode */}
                        <CustomInput text={'Refer Code'} placeholder={'Enter your Refer Code'} value={data.refercode} onChangeText={(text) => on_Change(text, 'refercode')} />
                        {/* loginButton */}
                        <CustomButton title={'SignUp'} onPress={() => on_signup()} />
                        {/* registertxt */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                            <Text style={styles.signUpTxt}>Already have an account ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.signUpTxt, { color: CustomColor.buttonColor }]}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Image */}
                    <Image source={require('../../Assets/hill.png')} style={{ width: widthPercentageToDP(100), marginTop: 20, height: heightPercentageToDP(23) }} />
                </View>
            </Content>
        </Container>
    )
}

export default SignUp

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
    createTxt: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: CustomFont.Poppins_SemiBold,
    },
    signUpTxt: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: CustomFont.Poppins_Regular,
        color: CustomColor.grey

    },
    pickerView:
    {
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: .5,
        marginTop: 40,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: CustomColor.lightgrey,
        borderRadius: 10,
        width: '31%'
    }
})
