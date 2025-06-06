import React from 'react';
import {
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import i18n from '../i18n';

// Icons
import ClockIcon from '../assets/images/icons/clockIcon.svg';

const { width } = Dimensions.get('window');

interface EstablishmentOverviewProps {
    establishment: any;
    onImagePress: (imageIndex: number, images: string[]) => void;
}

const EstablishmentOverview: React.FC<EstablishmentOverviewProps> = ({
    establishment,
    onImagePress
}) => {
    return (
        <View style={overviewStyles.contentContainer}>
            <Text style={overviewStyles.sectionTitle}>{i18n.t('establishment.about')}</Text>
            <Text style={overviewStyles.description}>{establishment.fullDescription}</Text>

            {establishment.gallery && establishment.gallery.length > 0 && (
                <>
                    <Text style={overviewStyles.sectionTitle}>{i18n.t('establishment.gallery')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={overviewStyles.galleryContainer}>
                        {establishment.gallery.map((imageUrl: string, index: number) => {
                            const processedUrl = imageUrl.includes('drive.google.com/file/d/')
                                ? `https://drive.google.com/uc?export=view&id=${imageUrl.match(/\/d\/(.+?)\/view/)?.[1] || ''}`
                                : imageUrl;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => onImagePress(index, establishment.gallery)}
                                    style={overviewStyles.galleryImageContainer}
                                >
                                    <Image
                                        source={{ uri: processedUrl }}
                                        style={overviewStyles.galleryImage}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </>
            )}

            {establishment.openingHours && (
                <View style={overviewStyles.infoSection}>
                    <Text style={overviewStyles.sectionTitle}>{i18n.t('establishment.openingHours')}</Text>
                    <View style={overviewStyles.infoRow}>
                        <ClockIcon width={24} height={24} fill="#DAA520" />
                        <Text style={overviewStyles.infoText}>{establishment.openingHours}</Text>
                    </View>
                </View>
            )}

            {establishment.website && (
                <View style={overviewStyles.infoSection}>
                    <Text style={overviewStyles.sectionTitle}>{i18n.t('establishment.website')}</Text>
                    <TouchableOpacity
                        style={overviewStyles.websiteButton}
                        onPress={() => Linking.openURL(establishment.website.startsWith('http')
                            ? establishment.website
                            : `https://${establishment.website}`)}
                    >
                        <Text style={overviewStyles.websiteButtonText}>{establishment.website}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const overviewStyles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        marginBottom: 10,
        marginTop: 15,
    },
    description: {
        fontSize: width * 0.035,
        lineHeight: width * 0.05,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666666',
        marginBottom: 15,
    },
    galleryContainer: {
        marginVertical: 10,
    },
    galleryImageContainer: {
        marginRight: 10,
    },
    galleryImage: {
        width: width * 0.4,
        height: width * 0.3,
        borderRadius: 8,
    },
    infoSection: {
        marginTop: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        marginLeft: 10,
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666666',
    },
    websiteButton: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    websiteButtonText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
    },
});
export default EstablishmentOverview
