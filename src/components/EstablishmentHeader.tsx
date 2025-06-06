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
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import HeartIcon from '../assets/images/icons/heart_white.svg';
import ShareIcon from '../assets/images/icons/share.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

const { width } = Dimensions.get('window');

interface EstablishmentHeaderProps {
    establishment: any;
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
                    <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={onShare}
                    >
                        <ShareIcon width={20} height={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.headerIconButton, isFavorite && styles.headerIconButtonActive]}
                        onPress={onFavoriteToggle}
                        disabled={isUpdatingFavorite}
                    >
                        {isUpdatingFavorite ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <HeartIcon
                                width={20}
                                height={20}
                                fill={isFavorite ? '#FF6F61' : 'none'}
                                stroke="#FFFFFF"
                                strokeWidth="1"
                            />
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
                    onPress={onLikeToggle}
                    disabled={updatingLikes.has(establishmentId)}
                >
                    {updatingLikes.has(establishmentId) ? (
                        <ActivityIndicator size="small" color="#495057" />
                    ) : (
                        <>
                            <ThumbIcon
                                width={18}
                                height={18}
                                fill={userLikes.includes(establishmentId) ? "#DAA520" : "#999"}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[
                                styles.reviewCount,
                                userLikes.includes(establishmentId) && styles.reviewCountActive
                            ]}>
                                {establishment.reviewCount || 0}
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
    headerActions: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    headerIconButton: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: 'rgba(70, 70, 70, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerIconButtonActive: {
        backgroundColor: 'rgba(255, 111, 97, 0.8)',
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