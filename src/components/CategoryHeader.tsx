import React from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UIIcon } from './icons/IconSystem'; // ✅ Importar UIIcon

const { width } = Dimensions.get('window');

interface CategoryHeaderProps {
    locationName: string;
    onBack: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ locationName, onBack }) => {
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
            <SafeAreaView
                style={styles.safeHeaderContainer}
                edges={['top']}
            // ✅ FORZAR eliminación de shadow en SafeAreaView
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        {/* ✅ REEMPLAZAR SVG POR UIICON CON FONDO */}
                        <View style={styles.iconBackground}>
                            <UIIcon
                                name="arrow-left-bg"
                                size={width * 0.045} // Más pequeño para el fondo
                                color="#333" // Color más oscuro para contraste
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.locationText}>{locationName}, Portugal</Text>
                </View>
                {/* ✅ SEPARADOR INVISIBLE PARA FORZAR ELIMINACIÓN DE SHADOW */}
                <View style={styles.shadowKiller} />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeHeaderContainer: {
        backgroundColor: 'white',
        zIndex: 1,
        // ✅ ELIMINAR cualquier shadow que pueda causar la línea
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.03,
        backgroundColor: 'white',
        // ✅ ELIMINAR cualquier shadow aquí también
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    backButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // ✅ NUEVO ESTILO PARA EL FONDO DEL ICONO
    iconBackground: {
        width: width * 0.08,
        height: width * 0.08,
        backgroundColor: '#DEE2E6', // Fondo gris como el original
        borderRadius: width * 0.02, // Esquinas redondeadas
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        marginLeft: width * 0.03,
    },
    // ✅ SEPARADOR PARA MATAR SHADOW
    shadowKiller: {
        height: 1,
        backgroundColor: 'white',
        marginTop: -1,
    },
});

export default CategoryHeader;