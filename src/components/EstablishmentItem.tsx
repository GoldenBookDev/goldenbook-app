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

// Icons
import { UIIcon } from './icons/IconSystem'; // ✅ Solo UIIcon necesario

const { width } = Dimensions.get('window');

interface EstablishmentItemProps {
    item: Establishment;
    isFavorite: boolean;
    isUpdatingFavorite: boolean;
    isLiked: boolean;
    isUpdatingLike: boolean;
    onPress: () => void;
    onFavoriteToggle: () => void;
    onLikeToggle: () => void;
    showCategory?: boolean;
}

const EstablishmentItem: React.FC<EstablishmentItemProps> = ({
    item,
    isFavorite,
    isUpdatingFavorite,
    isLiked,
    isUpdatingLike,
    onPress,
    onFavoriteToggle,
    onLikeToggle,
    showCategory = true
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

    // ✅ NUEVA FUNCIÓN: Procesar horarios de apertura
    const parseOpeningHours = (openingHours: string) => {
        if (!openingHours || openingHours.trim() === '') {
            return null;
        }

        try {
            // Obtener el día actual (0 = Domingo, 1 = Lunes, etc.)
            const today = new Date().getDay();
            const currentHour = new Date().getHours();
            const currentMinutes = new Date().getMinutes();
            const currentTime = currentHour * 60 + currentMinutes; // En minutos desde medianoche

            // Mapeo de días en diferentes idiomas
            const dayMappings: { [key: string]: number } = {
                // Portugués
                'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3,
                'quinta': 4, 'sexta': 5, 'sábado': 6,
                // Inglés
                'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                'thursday': 4, 'friday': 5, 'saturday': 6
            };

            // Normalizar el texto
            const normalizedHours = openingHours.toLowerCase();

            // Verificar si está cerrado hoy
            if (normalizedHours.includes('fechado') || normalizedHours.includes('closed')) {
                return { isOpen: false, message: i18n.t('establishment.closed') || 'Closed' };
            }

            // Buscar patrones de horarios (ej: "12:00 – 15:00; 18:00 – 22:00")
            const timeRangeRegex = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g;
            const timeRanges = [...normalizedHours.matchAll(timeRangeRegex)];

            if (timeRanges.length > 0) {
                // Verificar si está abierto ahora
                let isCurrentlyOpen = false;
                let nextOpenTime = '';
                let closingTime = '';

                for (const range of timeRanges) {
                    const openHour = parseInt(range[1]);
                    const openMin = parseInt(range[2]);
                    const closeHour = parseInt(range[3]);
                    const closeMin = parseInt(range[4]);

                    const openTime = openHour * 60 + openMin;
                    const closeTime = closeHour * 60 + closeMin;

                    if (currentTime >= openTime && currentTime <= closeTime) {
                        isCurrentlyOpen = true;
                        closingTime = `${range[3]}:${range[4]}`;
                        break;
                    } else if (currentTime < openTime && !nextOpenTime) {
                        nextOpenTime = `${range[1]}:${range[2]}`;
                    }
                }

                if (isCurrentlyOpen) {
                    return {
                        isOpen: true,
                        message: `${i18n.t('category.closes')} ${closingTime}`
                    };
                } else if (nextOpenTime) {
                    return {
                        isOpen: false,
                        message: `${i18n.t('establishment.opensAt')} ${nextOpenTime}` || `Opens at ${nextOpenTime}`
                    };
                } else {
                    return {
                        isOpen: false,
                        message: i18n.t('establishment.closedToday') || 'Closed today'
                    };
                }
            }

            // Si no se puede parsear, mostrar texto simplificado
            return {
                isOpen: null, // Estado desconocido
                message: openingHours.length > 30
                    ? `${openingHours.substring(0, 27)}...`
                    : openingHours
            };

        } catch (error) {
            console.warn('Error parsing opening hours:', error);
            return null;
        }
    };

    // ✅ RENDERIZAR STATUS DE HORARIOS
    const renderOpeningStatus = () => {
        const hoursInfo = parseOpeningHours(item.openingHours);

        if (!hoursInfo) {
            return null; // No mostrar nada si no hay horarios
        }

        const { isOpen, message } = hoursInfo;

        return (
            <Text style={styles.statusText}>
                {isOpen === true && (
                    <>
                        <Text style={styles.openText}>{i18n.t('category.open')}</Text>
                        <Text style={styles.closeText}> · {message}</Text>
                    </>
                )}
                {isOpen === false && (
                    <Text style={styles.closedText}>{message}</Text>
                )}
                {isOpen === null && (
                    <Text style={styles.hoursText}>{message}</Text>
                )}
            </Text>
        );
    };

    const imageUrl = item.mainImage ? getImageUrl(item.mainImage) : '';
    const primaryCategory = item.categories && item.categories.length > 0 ? item.categories[0] : '';

    return (
        <TouchableOpacity style={styles.establishmentCard} onPress={onPress}>
            <View style={styles.establishmentImageContainer}>
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={styles.establishmentImage}
                />
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
            </View>

            <View style={styles.establishmentInfo}>
                <View style={styles.establishmentTitleRow}>
                    <Text style={styles.establishmentName}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                    </Text>
                    {showCategory && (
                        <Text style={styles.establishmentCategory}>
                            {primaryCategory ? getCategoryTitle(primaryCategory) : i18n.t('home.place')}
                        </Text>
                    )}
                </View>

                <Text style={styles.establishmentLocation}>
                    {item.address} · {item.city}
                </Text>

                <View style={styles.establishmentDetails}>
                    <TouchableOpacity
                        style={[
                            styles.likeContainer,
                            isLiked && styles.likeContainerActive,
                            isUpdatingLike && styles.likeContainerDisabled
                        ]}
                        onPress={onLikeToggle}
                        disabled={isUpdatingLike}
                    >
                        {isUpdatingLike ? (
                            <ActivityIndicator size="small" color="#495057" />
                        ) : (
                            <>
                                {/* ✅ SIMPLIFICADO: Solo el icono sin fondo circular */}
                                <UIIcon
                                    name="thumb"
                                    size={width * 0.035}
                                    color={isLiked ? "#915A17" : "#666"}
                                />
                                <Text style={[
                                    styles.reviewCount,
                                    isLiked && styles.reviewCountActive
                                ]}>
                                    {item.reviewCount || 0}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.accessibilityAndStatus}>
                        <Image
                            source={require('../assets/images/icons/wheelchair.png')}
                            style={styles.wheelchairIcon}
                        />
                        {/* ✅ USAR HORARIOS DINÁMICOS */}
                        {renderOpeningStatus()}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    establishmentCard: {
        backgroundColor: 'white',
        marginHorizontal: width * 0.04,
        marginVertical: width * 0.02,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    establishmentImageContainer: {
        height: width * 0.5,
        position: 'relative',
    },
    establishmentImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    favoriteButton: {
        position: 'absolute',
        top: width * 0.03,
        right: width * 0.03,
    },
    favoriteIconContainer: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
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
        fontSize: width * 0.05,
        color: 'white',
    },
    favoriteIconActive: {
        color: '#FF6F61',
    },
    establishmentInfo: {
        padding: width * 0.04,
    },
    establishmentTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: width * 0.015,
    },
    establishmentName: {
        fontSize: width * 0.045,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        flex: 1,
    },
    establishmentCategory: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#915A17',
    },
    establishmentLocation: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        marginBottom: width * 0.025,
    },
    establishmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.01,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        backgroundColor: '#F8F9FA',
        minWidth: width * 0.14,
        justifyContent: 'center',
        gap: width * 0.01,
    },
    likeContainerActive: {
        borderColor: '#DAA520',
        backgroundColor: 'rgba(218, 165, 32, 0.2)',
    },
    likeContainerDisabled: {
        opacity: 0.7,
    },
    reviewCount: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#495057',
    },
    reviewCountActive: {
        color: '#915A17',
        fontFamily: 'EuclidSquare-Medium',
    },
    accessibilityAndStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    wheelchairIcon: {
        width: width * 0.04,
        height: width * 0.04,
        marginRight: width * 0.01,
    },
    statusText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
    },
    openText: {
        color: '#00AA44',
    },
    closeText: {
        color: '#6C757D',
    },
    closedText: {
        color: '#DC3545', // Rojo para cerrado
    },
    hoursText: {
        color: '#6C757D', // Gris para horarios generales
    },
});

export default EstablishmentItem;