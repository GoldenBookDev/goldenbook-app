import React from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';

// Icons
import PhoneIcon from '../assets/images/icons/phone.svg';

const { width } = Dimensions.get('window');

interface EstablishmentReservationsProps {
    establishment: any;
}

const EstablishmentReservations: React.FC<EstablishmentReservationsProps> = ({ establishment }) => {
    const handleReservationPress = () => {
        if (!establishment.reservationLink) {
            Alert.alert(
                i18n.t('establishment.noReservationMethod'),
                i18n.t('establishment.contactDirectly')
            );
            return;
        }

        const reservationLink = establishment.reservationLink.trim();

        // Limpiar el string para detectar teléfono
        const cleanedForPhone = reservationLink.replace(/[\s\-\(\)\.+]/g, '');

        // Detectar si es un número de teléfono
        const isPhone = /^\d{7,15}$/.test(cleanedForPhone) &&
            /[\d\s\-\(\)\+\.]{7,}/.test(reservationLink);

        // Detectar si es un email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(reservationLink);

        // Detectar si es una URL
        const urlRegex = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i;
        const isUrl = urlRegex.test(reservationLink);

        try {
            if (isPhone) {
                Alert.alert(
                    '📞 Teléfono Detectado',
                    `Llamando a ${reservationLink}\n\n(La app de teléfono se abrirá)`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Llamar', onPress: () => Linking.openURL(`tel:${cleanedForPhone}`) }
                    ]
                );
            } else if (isEmail) {
                Alert.alert(
                    '📧 Email Detectado',
                    `Enviando email a ${reservationLink}\n\n(La app de email se abrirá)`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Enviar Email', onPress: () => Linking.openURL(`mailto:${reservationLink}`) }
                    ]
                );
            } else if (isUrl) {
                const finalUrl = reservationLink.startsWith('http')
                    ? reservationLink
                    : `https://${reservationLink}`;
                Alert.alert(
                    '🌐 Sitio Web Detectado',
                    `Abriendo ${reservationLink}\n\n(El navegador se abrirá)`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Abrir Sitio', onPress: () => Linking.openURL(finalUrl) }
                    ]
                );
            } else {
                Alert.alert(
                    i18n.t('establishment.chooseContactMethod'),
                    reservationLink,
                    [
                        {
                            text: i18n.t('establishment.openAsWebsite'),
                            onPress: () => {
                                const url = reservationLink.startsWith('http')
                                    ? reservationLink
                                    : `https://${reservationLink}`;
                                Linking.openURL(url);
                            }
                        },
                        {
                            text: i18n.t('establishment.callNumber'),
                            onPress: () => {
                                const cleanPhone = reservationLink.replace(/[\s\-\(\)\.+]/g, '');
                                Linking.openURL(`tel:${cleanPhone}`);
                            }
                        },
                        {
                            text: i18n.t('establishment.sendEmail'),
                            onPress: () => Linking.openURL(`mailto:${reservationLink}`)
                        },
                        { text: i18n.t('establishment.cancel'), style: 'cancel' }
                    ]
                );
            }
        } catch (error) {
            console.error('Error opening reservation link:', error);
            Alert.alert(
                i18n.t('establishment.error'),
                i18n.t('establishment.cannotOpenReservation')
            );
        }
    };

    return (
        <>
            <View style={reservationsStyles.contentContainer}>
                <Text style={reservationsStyles.reservationsTitle}>
                    {i18n.t('establishment.makeReservation')}
                </Text>
                <Text style={reservationsStyles.reservationsDescription}>
                    {i18n.t('establishment.bookSpot').replace('{name}', establishment.name)}
                </Text>

                {!establishment.reservationLink && !establishment.phone && (
                    <Text style={reservationsStyles.noReservationsText}>
                        {i18n.t('establishment.noOnlineReservations')}
                    </Text>
                )}
            </View>

            {/* Fixed bottom reservation button */}
            <SafeAreaView style={reservationsStyles.fixedBottomContainer} edges={['bottom']}>
                <View style={reservationsStyles.fixedBottomContent}>
                    {establishment.reservationLink ? (
                        <TouchableOpacity
                            onPress={handleReservationPress}
                            style={reservationsStyles.fixedReserveButton}
                        >
                            <Text style={reservationsStyles.fixedReserveText}>
                                {i18n.t('establishment.reserveNow')}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        establishment.phone && (
                            <TouchableOpacity
                                style={reservationsStyles.fixedPhoneButton}
                                onPress={() => Linking.openURL(`tel:${establishment.phone}`)}
                            >
                                <PhoneIcon width={20} height={20} fill="#FFF" style={reservationsStyles.phoneButtonIcon} />
                                <Text style={reservationsStyles.fixedPhoneText}>
                                    {establishment.phone}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </SafeAreaView>
        </>
    );
};

const reservationsStyles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
    reservationsTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginBottom: 10,
    },
    reservationsDescription: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666666',
        marginBottom: 25,
    },
    noReservationsText: {
        fontSize: width * 0.035,
        color: '#666666',
        fontFamily: 'EuclidSquare-Regular',
        marginVertical: 15,
    },
    fixedBottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    fixedBottomContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    fixedReserveButton: {
        backgroundColor: '#00B383',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    fixedReserveText: {
        fontSize: width * 0.042,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#FFFFFF',
    },
    fixedPhoneButton: {
        backgroundColor: '#00B383',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixedPhoneText: {
        fontSize: width * 0.042,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    phoneButtonIcon: {
        marginRight: 10,
    },
});
export default EstablishmentReservations