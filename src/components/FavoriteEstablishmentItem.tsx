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

const { width } = Dimensions.get('window');

interface FavoriteEstablishmentItemProps {
    item: Establishment;
    isRemoving: boolean;
    isLiked: boolean;
    isUpdatingLike: boolean;
    onPress: () => void;
    onRemoveFromFavorites: () => void;
    onLikeToggle: () => void;
}

const FavoriteEstablishmentItem: React.FC<FavoriteEstablishmentItemProps> = ({
    item,
    isRemoving,
    isLiked,
    isUpdatingLike,
    onPress,
    onRemoveFromFavorites,
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

    const imageUrl = item.mainImage ? getImageUrl(item.mainImage) : '';
    const primaryCategory = item.categories && item.categories.length > 0 ? item.categories[0] : '';

    return (
        <TouchableOpacity
            style={favoriteItemStyles.favoriteCard}
            onPress={onPress}
            disabled={isRemoving}
        >
            <View style={favoriteItemStyles.favoriteImageContainer}>
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')}
                    style={favoriteItemStyles.favoriteImage}
                />

                <TouchableOpacity
                    style={favoriteItemStyles.favoriteButton}
                    onPress={onRemoveFromFavorites}
                    disabled={isRemoving}
                >
                    <View style={[
                        favoriteItemStyles.favoriteIconContainer,
                        isRemoving && favoriteItemStyles.favoriteIconContainerDisabled
                    ]}>
                        {isRemoving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={favoriteItemStyles.favoriteIconActive}>♥</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={favoriteItemStyles.favoriteInfo}>
                <View style={favoriteItemStyles.favoriteTitleRow}>
                    <Text style={favoriteItemStyles.favoriteName}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                    </Text>
                    <Text style={favoriteItemStyles.favoriteCategory}>
                        {primaryCategory ? getCategoryTitle(primaryCategory) : i18n.t('home.place')}
                    </Text>
                </View>

                <Text style={favoriteItemStyles.favoriteLocation}>
                    {item.address} · {item.city}
                </Text>

                <View style={favoriteItemStyles.favoriteDetails}>
                    <TouchableOpacity
                        style={[
                            favoriteItemStyles.likeContainer,
                            isLiked && favoriteItemStyles.likeContainerActive,
                            isUpdatingLike && favoriteItemStyles.likeContainerDisabled
                        ]}
                        onPress={onLikeToggle}
                        disabled={isUpdatingLike}
                    >
                        {isUpdatingLike ? (
                            <ActivityIndicator size="small" color="#495057" />
                        ) : (
                            <>
                                <ThumbIcon
                                    width={width * 0.035}
                                    height={width * 0.035}
                                    fill={isLiked ? "#DAA520" : "#997B41"}
                                />
                                <Text style={[
                                    favoriteItemStyles.reviewCount,
                                    isLiked && favoriteItemStyles.reviewCountActive
                                ]}>
                                    {item.reviewCount || 0}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const favoriteItemStyles = StyleSheet.create({
    favoriteCard: {
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
    favoriteImageContainer: {
        height: width * 0.5,
        position: 'relative',
    },
    favoriteImage: {
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
    favoriteIconActive: {
        fontSize: width * 0.05,
        color: '#FF6F61',
    },
    favoriteInfo: {
        padding: width * 0.04,
    },
    favoriteTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: width * 0.015,
    },
    favoriteName: {
        fontSize: width * 0.045,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        flex: 1,
        marginRight: width * 0.02,
    },
    favoriteCategory: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#997B41',
    },
    favoriteLocation: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        marginBottom: width * 0.025,
    },
    favoriteDetails: {
        flexDirection: 'row',
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
        color: '#666',
        marginLeft: width * 0.01,
    },
    reviewCountActive: {
        color: '#495057',
    },
});

export default FavoriteEstablishmentItem;