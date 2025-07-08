import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons
import { UIIcon } from './icons/IconSystem'; // ✅ Importar UIIcon

const { width } = Dimensions.get('window');

interface EstablishmentHeaderProps {
    establishment: {
        mainImage: string;
        name: string;
        reviewCount?: number;
        [key: string]: any;
    };
    navigation: any;
    isFavorite: boolean;
    isUpdatingFavorite: boolean;
    userLikes: string[];
    updatingLikes: Set<string>;
    establishmentId: string;
    onFavoriteToggle: () => void;
    onLikeToggle: () => void;
    onShare: () => void;
}

const EstablishmentHeader: React.FC<EstablishmentHeaderProps> = ({
    establishment,
    navigation,
    isFavorite,
    isUpdatingFavorite,
    userLikes,
    updatingLikes,
    establishmentId,
    onFavoriteToggle,
    onLikeToggle,
    onShare
}) => {
    return (
        <View style={styles.header}>
            <Image
                source={{ uri: establishment.mainImage }}
                style={styles.image}
            />
            <SafeAreaView style={styles.safeHeaderContent} edges={['top']}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    {/* ✅ REEMPLAZAR SVG POR UIICON CON FONDO */}
                    <View style={styles.iconBackground}>
                        <UIIcon
                            name="arrow-left-bg"
                            size={width * 0.045} // Icono un poco más pequeño para el fondo
                            color="#FFFFFF" // Blanco para contraste
                        />
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={onShare}
                    >
                        {/* ✅ REEMPLAZAR SVG POR UIICON CON FONDO */}
                        <View style={styles.iconBackground}>
                            <UIIcon
                                name="share"
                                size={18}
                                color="#FFFFFF"
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={onFavoriteToggle}
                        disabled={isUpdatingFavorite}
                    >
                        {isUpdatingFavorite ? (
                            <View style={styles.iconBackground}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            </View>
                        ) : (
                            <View style={styles.iconBackground}>
                                <UIIcon
                                    name="love"
                                    size={18}
                                    color={isFavorite ? '#FF6F61' : '#FFFFFF'}
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                    {establishment.name.charAt(0).toUpperCase() + establishment.name.slice(1).toLowerCase()}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.likeContainer,
                        userLikes.includes(establishmentId) && styles.likeContainerActive,
                        updatingLikes.has(establishmentId) && styles.likeContainerDisabled
                    ]}
                    onPress={onLikeToggle} // ✅ Usar directamente la función del padre
                    disabled={updatingLikes.has(establishmentId)}
                >
                    {updatingLikes.has(establishmentId) ? (
                        <ActivityIndicator size="small" color="#495057" />
                    ) : (
                        <>
                            {/* ✅ REEMPLAZAR SVG POR UIICON */}
                            <UIIcon
                                name="thumb"
                                size={18}
                                color={userLikes.includes(establishmentId) ? "#915A17" : "#999"}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[
                                styles.reviewCount,
                                userLikes.includes(establishmentId) && styles.reviewCountActive
                            ]}>
                                {establishment.reviewCount || 0} {/* ✅ Usar directamente la prop */}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: width * 0.85,
        resizeMode: 'cover',
        marginTop: -50,
    },
    safeHeaderContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    // ✅ NUEVO ESTILO PARA EL FONDO DEL ICONO
    iconBackground: {
        width: width * 0.08,
        height: width * 0.08,
        backgroundColor: '#343A40', // ✅ Color de fondo específico
        borderRadius: width * 0.02, // Esquinas redondeadas
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    headerIconButton: {
        width: 32,
        height: 32,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        // ✅ QUITAR backgroundColor ya que usamos iconBackground
    },
    headerIconButtonActive: {
        // ✅ YA NO NECESARIO porque el color se maneja en el icono
    },
    titleContainer: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: 'rgba(22, 27, 51, 0.8)',
    },
    title: {
        fontSize: width * 0.06,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#FFFFFF',
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.03,
        paddingVertical: width * 0.015,
        borderRadius: 12,
        gap: width * 0.01,
        minWidth: width * 0.12,
        maxWidth: width * 0.2,
        justifyContent: 'flex-start',
    },
    likeContainerActive: {
        borderColor: '#DAA520',
        backgroundColor: '#F8EDD2',
    },
    likeContainerDisabled: {
        opacity: 0.7,
    },
    reviewCount: {
        color: '#FFFFFF',
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
    },
    reviewCountActive: {
        color: '#495057',
    },
});

export default EstablishmentHeader;