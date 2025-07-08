import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../i18n';

// Icons
import { UIIcon } from './icons/IconSystem'; // ✅ Solo UIIcon necesario

const { width } = Dimensions.get('window');

interface EstablishmentContactsProps {
    establishment: any;
    navigation: any;
    establishmentId: string;
}

const EstablishmentContacts: React.FC<EstablishmentContactsProps> = ({
    establishment,
    navigation,
    establishmentId
}) => {
    const handleGoToMap = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('@goldenbook_selected_location');
            navigation.navigate('MapScreen', {
                selectedLocation: savedLocation || undefined,
                focusEstablishmentId: establishmentId,
                openModal: true
            });
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            navigation.navigate('MapScreen', {
                focusEstablishmentId: establishmentId,
                openModal: true
            });
        }
    };

    return (
        <View style={contactsStyles.contactsContainer}>
            <View style={contactsStyles.contactRow}>
                <View style={contactsStyles.iconCircle}>
                    {/* ✅ REEMPLAZAR LocationIcon por UIIcon */}
                    <UIIcon name="location" size={20} color="#915A17" />
                </View>
                <View style={contactsStyles.contactContent}>
                    <Text style={[contactsStyles.contactText, contactsStyles.addressText]}>
                        {establishment.address}, {establishment.city}
                    </Text>
                </View>
                <TouchableOpacity style={contactsStyles.goButton} onPress={handleGoToMap}>
                    {/* ✅ REEMPLAZAR GoArrowIcon por UIIcon send */}
                    <UIIcon name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={contactsStyles.contactRow}>
                <View style={contactsStyles.iconCircle}>
                    {/* ✅ REEMPLAZAR PhoneIcon por UIIcon */}
                    <UIIcon name="phone" size={20} color="#915A17" />
                </View>
                <Text style={contactsStyles.contactText}>
                    {establishment.phone || i18n.t('establishment.noPhoneAvailable')}
                </Text>
            </View>

            <View style={contactsStyles.contactRow}>
                <View style={contactsStyles.iconCircle}>
                    {/* ✅ REEMPLAZAR EmailIcon por UIIcon */}
                    <UIIcon name="mail" size={20} color="#915A17" />
                </View>
                <Text style={contactsStyles.contactText}>
                    {establishment.email || i18n.t('establishment.noEmailAvailable')}
                </Text>
            </View>

            <View style={contactsStyles.contactRow}>
                <View style={contactsStyles.iconCircle}>
                    {/* ✅ REEMPLAZAR ClockIcon por UIIcon */}
                    <UIIcon name="time" size={20} color="#915A17" />
                </View>
                <View style={contactsStyles.scheduleContainer}>
                    <Text style={[contactsStyles.contactText, contactsStyles.openNowText]}>
                        {i18n.t('establishment.openNow')}
                    </Text>
                    <Text style={contactsStyles.closeTimeText}>• {i18n.t('establishment.closes')} 23:30</Text>
                </View>
            </View>

            <View style={contactsStyles.footerContainer}>
                <Text style={contactsStyles.exclusiveGuestCare}>
                    {i18n.t('establishment.exclusiveGuestCare')}
                </Text>
            </View>
        </View>
    );
};

const contactsStyles = StyleSheet.create({
    contactsContainer: {
        padding: 20,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF8E7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactContent: {
        flex: 1,
        marginRight: 15,
    },
    contactText: {
        flex: 1,
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#915A17',
        marginLeft: 15,
    },
    addressText: {
        color: 'black',
    },
    goButton: {
        backgroundColor: '#DAA520', // ✅ CAMBIAR color para consistencia
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    scheduleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    openNowText: {
        color: '#008000',
        marginRight: 4,
    },
    closeTimeText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#777777',
    },
    footerContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 20,
        paddingVertical: 15,
        gap: 15,
    },
    exclusiveGuestCare: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        textAlign: 'left',
    },
});

export default EstablishmentContacts;