import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Establishment } from '../services/firestoreService';

import { CategoryIcon, UIIcon } from '../components/icons/IconSystem';

const { width } = Dimensions.get('window');

const iconMapping: { [key: string]: string } = {
    'culture': 'culture',
    'gastronomy': 'gastronomy',
    'sports': 'sports',
    'events': 'events',
    'shops': 'shops',
    'beaches': 'beaches',
    'transport': 'transport',
    'activities': 'activities',
};

interface CategoryWithTranslation {
    id: string;
    title: string;
    icon: string;
    translatedTitle?: string;
}

interface MarkerDetailsCardProps {
    establishment: Establishment | null;
    categories: CategoryWithTranslation[];
    onClose: () => void;
    onPress: () => void;
}

const MarkerDetailsCard: React.FC<MarkerDetailsCardProps> = ({
    establishment,
    categories,
    onClose,
    onPress
}) => {
    if (!establishment) return null;

    const getImageUrl = (url: string) => {
        if (url && url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/d\/(.+?)\/view/);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        }
        return url || '';
    };

    const getCategoryTitle = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
            const title = category.translatedTitle || category.title;
            return String(title || categoryId);
        }
        return String(categoryId || '').charAt(0).toUpperCase() + String(categoryId || '').slice(1);
    };

    const imageUrl = establishment.mainImage ? getImageUrl(establishment.mainImage) : '';
    const primaryCategory = establishment.categories && establishment.categories.length > 0
        ? establishment.categories[0]
        : 'gastronomy';

    const categoryIconId = iconMapping[primaryCategory] || 'gastronomy';
    const categoryTitle = getCategoryTitle(primaryCategory);

    return (
        <View style={cardStyles.markerCardContainer}>
            <TouchableOpacity style={cardStyles.markerCard} onPress={onPress}>
                <TouchableOpacity style={cardStyles.closeCardButton} onPress={onClose}>
                    <UIIcon name="close" size={width * 0.04} color="#1A1A2E" />
                </TouchableOpacity>

                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={cardStyles.markerCardImage}
                />

                {/* ✅ NUEVO: Icono de categoría en esquina superior izquierda */}
                <View style={cardStyles.categoryIconTopLeft}>
                    <CategoryIcon
                        category={categoryIconId}
                        type="category"
                        size={width * 0.08}
                        iconSize={width * 0.04}
                        iconColor="#FFFFFF"
                        backgroundColor="rgba(0, 0, 0, 0.5)" // ✅ Fondo oscuro semi-transparente
                    />
                </View>

                <View style={cardStyles.markerCardInfo}>
                    <Text style={cardStyles.markerCardTitle}>{establishment.name}</Text>
                    <Text style={cardStyles.markerCardDescription} numberOfLines={2}>
                        {(establishment.shortDescription || 'Estabelecimento')} • {establishment.address ? `${establishment.address.substring(0, 30)}...` : 'Morada não disponível'}
                    </Text>
                    <View style={cardStyles.thumbContainer}>
                        <UIIcon
                            name="star"
                            size={width * 0.04}
                            color="#FFD700"
                            style={{ marginRight: width * 0.01 }}
                        />
                        <Text style={cardStyles.reviewCount}>{establishment.reviewCount || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const cardStyles = StyleSheet.create({
    markerCardContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? width * 0.08 : width * 0.05,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    markerCard: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 12,
        flexDirection: 'row',
        height: width * 0.25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    markerCardImage: {
        width: width * 0.25,
        height: '100%',
        resizeMode: 'cover',
    },
    markerCardInfo: {
        flex: 1,
        padding: width * 0.03,
        justifyContent: 'center',
        paddingTop: width * 0.04,
    },
    markerCardTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginTop: width * 0.02,
    },
    markerCardDescription: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
        marginBottom: width * 0.02,
        lineHeight: width * 0.04,
    },
    // ✅ NUEVO: Estilo para el icono de categoría en esquina superior izquierda
    categoryIconTopLeft: {
        position: 'absolute',
        top: width * 0.02,
        left: width * 0.02,
        zIndex: 5,
    },
    thumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.02,
    },
    reviewCount: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
    },
    closeCardButton: {
        position: 'absolute',
        top: width * 0.02,
        right: width * 0.02,
        zIndex: 10,
        backgroundColor: 'white',
        borderRadius: width * 0.04,
        padding: width * 0.01,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
});

export default MarkerDetailsCard;