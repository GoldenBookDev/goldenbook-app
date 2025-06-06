import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ThumbIcon from '../assets/images/icons/thumb.svg';
import i18n from '../i18n';
import { Establishment } from '../services/firestoreService';

const { width } = Dimensions.get('window');

interface EstablishmentCardProps {
    establishment: Establishment;
    onPress: () => void;
}

const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ establishment, onPress }) => {
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
    const primaryCategory = establishment.categories && establishment.categories.length > 0 ? establishment.categories[0] : '';

    return (
        <TouchableOpacity style={styles.placeCard} onPress={onPress}>
            <View style={styles.placeImageContainer}>
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={styles.placeImage}
                    onError={() => console.log(`Failed to load image for ${establishment.name}`)}
                />
                <View style={styles.categoryTag}>
                    <View style={styles.categoryTagContent}>
                        <Image
                            source={require('../assets/images/icons/plate.png')}
                            style={styles.categoryIcon}
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
                <View style={styles.thumbContainer}>
                    <ThumbIcon
                        width={width * 0.04}
                        height={width * 0.04}
                        fill="#997B41"
                        style={{ marginRight: width * 0.01 }}
                    />
                    <Text style={styles.reviewCount}>{establishment.reviewCount || 0}</Text>
                </View>
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
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    categoryIcon: {
        width: width * 0.04,
        height: width * 0.04,
        marginRight: width * 0.01,
        tintColor: '#FFFFFF',
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
    thumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 0.01,
    },
    reviewCount: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
    },
});

export default EstablishmentCard;