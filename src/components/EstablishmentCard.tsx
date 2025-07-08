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
import i18n from '../i18n';
import { Establishment } from '../services/firestoreService';
import { CategoryIcon, UIIcon } from './icons/IconSystem';

const { width } = Dimensions.get('window');

interface EstablishmentCardProps {
    establishment: Establishment;
    onPress: () => void;
    // ✅ AGREGAR: Props para manejar favoritos y likes
    isFavorite?: boolean;
    isUpdatingFavorite?: boolean;
    isLiked?: boolean;
    isUpdatingLike?: boolean;
    onFavoriteToggle?: () => void;
    onLikeToggle?: () => void;
}

const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
    establishment,
    onPress,
    // ✅ AGREGAR: Destructuring de las nuevas props con defaults
    isFavorite = false,
    isUpdatingFavorite = false,
    isLiked = false,
    isUpdatingLike = false,
    onFavoriteToggle,
    onLikeToggle
}) => {
    const getImageUrl = (url: string) => {
        if (url && url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/d\/(.+?)\/view/);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        }
        return url || '';
    };

    const getCategoryTitle = (categoryId: string) => {
        const translatedTitle = i18n.t(`categories.${categoryId}`);
        if (translatedTitle !== `categories.${categoryId}`) {
            return translatedTitle;
        }
        return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    };

    const imageUrl = establishment.mainImage ? getImageUrl(establishment.mainImage) : '';

    // ✅ OBTENER LA PRIMERA CATEGORÍA
    const primaryCategory = establishment.categories && establishment.categories.length > 0
        ? establishment.categories[0]
        : 'culture'; // Fallback por defecto

    return (
        <TouchableOpacity style={styles.placeCard} onPress={onPress}>
            <View style={styles.placeImageContainer}>
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={styles.placeImage}
                    onError={() => console.log(`Failed to load image for ${establishment.name}`)}
                />

                {/* ✅ AGREGAR: Botón de favorito */}
                {onFavoriteToggle && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={onFavoriteToggle}
                        disabled={isUpdatingFavorite}
                    >
                        <View style={[
                            styles.favoriteIconContainer,
                            isUpdatingFavorite && styles.favoriteIconContainerDisabled
                        ]}>
                            {isUpdatingFavorite ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={[
                                    styles.favoriteIcon,
                                    isFavorite && styles.favoriteIconActive
                                ]}>
                                    {isFavorite ? '♥' : '♡'}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.categoryTag}>
                    <View style={styles.categoryTagContent}>
                        {/* ✅ ICONO DINÁMICO BASADO EN LA PRIMERA CATEGORÍA */}
                        <CategoryIcon
                            category={primaryCategory}
                            type="category"
                            size={width * 0.06} // Tamaño del contenedor
                            iconSize={width * 0.035} // Tamaño del icono interno
                            iconColor="#FFFFFF" // Blanco para contraste en tag oscuro
                            backgroundColor="transparent" // Sin fondo de gota aquí
                            style={styles.categoryIconWrapper}
                        />
                        <Text style={styles.categoryTagText}>
                            {primaryCategory ? getCategoryTitle(primaryCategory) : i18n.t('home.place')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.placeInfo}>
                <Text style={styles.placeName}>
                    {establishment.name.charAt(0).toUpperCase() + establishment.name.slice(1).toLowerCase()}
                </Text>
                <Text style={styles.establishmentLocation}>
                    {establishment.address} · {establishment.city}
                </Text>

                {/* ✅ ACTUALIZAR: Container de like ahora es interactivo */}
                <TouchableOpacity
                    style={[
                        styles.thumbContainer,
                        onLikeToggle && styles.thumbContainerInteractive,
                        isLiked && styles.thumbContainerActive,
                        isUpdatingLike && styles.thumbContainerDisabled
                    ]}
                    onPress={onLikeToggle}
                    disabled={isUpdatingLike || !onLikeToggle}
                >
                    {isUpdatingLike ? (
                        <ActivityIndicator size="small" color="#915A17" />
                    ) : (
                        <>
                            {/* ✅ REEMPLAZAR SVG POR UIICON */}
                            <UIIcon
                                name="thumb"
                                size={width * 0.04}
                                color={isLiked ? "#915A17" : "#666"} // ✅ Color dinámico
                                style={{ marginRight: width * 0.01 }}
                            />
                            <Text style={[
                                styles.reviewCount,
                                isLiked && styles.reviewCountActive
                            ]}>
                                {establishment.reviewCount || 0}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    placeCard: {
        width: width * 0.65,
        marginRight: width * 0.04,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        overflow: 'hidden',
    },
    placeImageContainer: {
        position: 'relative',
    },
    placeImage: {
        width: '100%',
        height: width * 0.35,
        resizeMode: 'cover',
    },
    // ✅ AGREGAR: Estilos para el botón de favorito
    favoriteButton: {
        position: 'absolute',
        top: width * 0.02,
        right: width * 0.02,
    },
    favoriteIconContainer: {
        width: width * 0.07,
        height: width * 0.07,
        borderRadius: width * 0.035,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    favoriteIconContainerDisabled: {
        opacity: 0.7,
    },
    favoriteIcon: {
        fontSize: width * 0.04,
        color: 'white',
    },
    favoriteIconActive: {
        color: '#FF6F61',
    },
    categoryTag: {
        position: 'absolute',
        top: width * 0.02,
        left: width * 0.02,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.01,
        borderRadius: 4,
    },
    categoryTagContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // ✅ NUEVO ESTILO PARA EL WRAPPER DEL ICONO
    categoryIconWrapper: {
        marginRight: width * 0.015,
    },
    categoryTagText: {
        color: 'white',
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Medium',
    },
    placeInfo: {
        padding: width * 0.03,
    },
    placeName: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginBottom: width * 0.01,
    },
    establishmentLocation: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        marginBottom: width * 0.025,
    },
    // ✅ ACTUALIZAR: Estilos del container de thumb
    thumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.01,
        paddingVertical: width * 0.005, // Pequeño padding para mejor touch area
    },
    thumbContainerInteractive: {
        // Padding adicional para área de toque cuando es interactivo
        paddingHorizontal: width * 0.01,
        paddingVertical: width * 0.01,
        borderRadius: 6,
    },
    thumbContainerActive: {
        //backgroundColor: 'rgba(218, 165, 32, 0.1)', // Fondo sutil cuando está activo
    },
    thumbContainerDisabled: {
        opacity: 0.7,
    },
    reviewCount: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
    },
    reviewCountActive: {
        color: '#915A17', // ✅ Color activo para el texto
        fontFamily: 'EuclidSquare-Medium',
    },
});

export default EstablishmentCard;