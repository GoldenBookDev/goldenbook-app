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
import ThumbIcon from '../assets/images/icons/thumb.svg';
import ThumbGrayIcon from '../assets/images/icons/thumb_gray.svg';

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
                                {isLiked ? (
                                    <ThumbIcon
                                        width={width * 0.035}
                                        height={width * 0.035}
                                        fill="#DAA520"
                                    />
                                ) : (
                                    <ThumbGrayIcon
                                        width={width * 0.035}
                                        height={width * 0.035}
                                    />
                                )}
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
                        <Text style={styles.statusText}>
                            <Text style={styles.openText}>{i18n.t('category.open')}</Text>
                            <Text style={styles.closeText}> · {i18n.t('category.closes')} 22:00</Text>
                        </Text>
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
        color: '#997B41',
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
        paddingHorizontal: width * 0.03,
        paddingVertical: width * 0.015,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        backgroundColor: '#F8F9FA',
        gap: width * 0.01,
        minWidth: width * 0.16,
        justifyContent: 'center',
    },
    likeContainerActive: {
        borderColor: '#DAA520',
        backgroundColor: '#F8EDD2',
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
        color: '#495057',
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
});

export default EstablishmentItem;