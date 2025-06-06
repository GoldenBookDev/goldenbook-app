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

// Icons
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

const { width } = Dimensions.get('window');

const iconMapping: { [key: string]: React.FC<any> } = {
    'culture': HandsIcon,
    'gastronomy': PlateIcon,
    'sports': SwimmerIcon,
    'events': CalendarIcon,
    'shops': ShopIcon,
    'beaches': BeachIcon,
    'transport': ServicesIcon,
    'activities': PeopleIcon,
};

interface MarkerDetailsCardProps {
    establishment: Establishment | null;
    categories: Array<{ id: string; title: string; icon: React.FC<any> }>;
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

    const getCategoryTitle = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    };

    const imageUrl = establishment.mainImage ? getImageUrl(establishment.mainImage) : '';
    const primaryCategory = establishment.categories && establishment.categories.length > 0
        ? establishment.categories[0]
        : 'gastronomy';
    const CategoryIcon = iconMapping[primaryCategory] || PlateIcon;
    const categoryTitle = getCategoryTitle(primaryCategory);

    return (
        <View style={cardStyles.markerCardContainer}>
            <TouchableOpacity style={cardStyles.markerCard} onPress={onPress}>
                <TouchableOpacity style={cardStyles.closeCardButton} onPress={onClose}>
                    <CloseIcon width={width * 0.04} height={width * 0.04} />
                </TouchableOpacity>

                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={cardStyles.markerCardImage}
                />

                <View style={cardStyles.markerCardInfo}>
                    <Text style={cardStyles.markerCardTitle}>{establishment.name}</Text>
                    <Text style={cardStyles.markerCardDescription}
                        numberOfLines={2}>
                        {establishment.shortDescription || 'Establecimiento'} • {establishment.address ? `${establishment.address.substring(0, 30)}...` : 'Dirección no disponible'}
                    </Text>
                    <View style={cardStyles.thumbContainer}>
                        <ThumbIcon width={width * 0.04} height={width * 0.04} style={{ marginRight: width * 0.01 }} />
                        <Text style={cardStyles.reviewCount}>{establishment.reviewCount || 0}</Text>
                    </View>
                </View>

                <View style={cardStyles.markerCardCategoryBottom}>
                    <View style={cardStyles.categoryTagContent}>
                        {React.createElement(CategoryIcon, {
                            width: width * 0.04,
                            height: width * 0.04,
                            fill: "#FFFFFF"
                        })}
                        <Text style={cardStyles.categoryTagText}>{categoryTitle}</Text>
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
        height: width * 0.25, // Añadir altura fija
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
        height: '100%', // Cambiar a 100%
        resizeMode: 'cover',
    },
    markerCardInfo: {
        flex: 1,
        padding: width * 0.03,
        justifyContent: 'center',
        paddingTop: width * 0.04, // Añadir más espacio arriba del título
    },
    markerCardTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginTop: width * 0.02, // Aumentar espacio debajo del título
    },
    markerCardDescription: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
        marginBottom: width * 0.02,
        lineHeight: width * 0.04, // Altura de línea consistente
    },
    markerCardCategoryBottom: {
        position: 'absolute',
        bottom: width * 0.02,
        right: width * 0.02,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.01,
        borderRadius: 4,
    },
    categoryTagContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryTagText: {
        color: 'white',
        fontSize: width * 0.025,
        fontFamily: 'EuclidSquare-Medium',
        marginLeft: width * 0.01,
    },
    thumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.02, // Añadir espacio debajo del thumb
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