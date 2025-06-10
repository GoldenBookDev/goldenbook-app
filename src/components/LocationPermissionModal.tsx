import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import i18n from '../i18n';

interface LocationPermissionModalProps {
    visible: boolean;
    onAllow: () => void;
    onDeny: () => void;
}

const { width } = Dimensions.get('window');

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
    visible,
    onAllow,
    onDeny,
}) => {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            // Añadidas estas props para asegurar que esté por encima de todo
            presentationStyle="overFullScreen"
            hardwareAccelerated={true}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="location"
                            size={width * 0.15}
                            color="#00B383"
                        />
                    </View>

                    <Text style={styles.title}>
                        {i18n.t('location.permissionTitle')}
                    </Text>

                    <Text style={styles.description}>
                        {i18n.t('location.permissionDescription')}
                    </Text>

                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00B383" />
                            <Text style={styles.benefitText}>
                                {i18n.t('location.benefit1') || 'Discover places near you'}
                            </Text>
                        </View>

                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00B383" />
                            <Text style={styles.benefitText}>
                                {i18n.t('location.benefit2') || 'Get accurate directions'}
                            </Text>
                        </View>

                        <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#00B383" />
                            <Text style={styles.benefitText}>
                                {i18n.t('location.benefit3') || 'Receive personalized recommendations'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.allowButton} onPress={onAllow}>
                        <Text style={styles.allowButtonText}>
                            {i18n.t('location.allowAccess')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
                        <Text style={styles.denyButtonText}>
                            {i18n.t('location.notNow')}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.privacyNote}>
                        {i18n.t('location.privacyNote')}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        // Asegurar z-index máximo
        zIndex: 9999,
        elevation: 9999,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: width * 0.06,
        margin: width * 0.05,
        alignItems: 'center',
        maxWidth: width * 0.9,
        // Asegurar que el contenedor también tenga z-index alto
        zIndex: 10000,
        elevation: 10000,
    },
    iconContainer: {
        backgroundColor: '#F0FDF9',
        borderRadius: 50,
        padding: width * 0.04,
        marginBottom: width * 0.04,
    },
    title: {
        fontSize: width * 0.05,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: width * 0.03,
    },
    description: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: width * 0.05,
        marginBottom: width * 0.05,
    },
    benefitsList: {
        width: '100%',
        marginBottom: width * 0.06,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: width * 0.03,
        width: '100%', // Asegurar ancho completo
    },
    benefitText: {
        fontSize: width * 0.033,
        fontFamily: 'EuclidSquare-Regular',
        color: '#374151',
        marginLeft: width * 0.03,
        flex: 1,
        lineHeight: width * 0.045,
        // Ajustes para asegurar visibilidad
        textAlign: 'left',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    allowButton: {
        backgroundColor: '#00B383',
        borderRadius: 12,
        paddingVertical: width * 0.04,
        paddingHorizontal: width * 0.08,
        width: '100%',
        alignItems: 'center',
        marginBottom: width * 0.03,
    },
    allowButtonText: {
        color: 'white',
        fontSize: width * 0.038,
        fontFamily: 'EuclidSquare-SemiBold',
    },
    denyButton: {
        paddingVertical: width * 0.03,
        paddingHorizontal: width * 0.04,
        marginBottom: width * 0.04,
    },
    denyButtonText: {
        color: '#6B7280',
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Medium',
    },
    privacyNote: {
        fontSize: width * 0.028,
        fontFamily: 'EuclidSquare-Regular',
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: width * 0.04,
    },
});

export default LocationPermissionModal;