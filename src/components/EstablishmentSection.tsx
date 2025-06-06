import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ArrowRightIcon from '../assets/images/icons/arrow-right-bg.svg';
import { Establishment } from '../services/firestoreService';
import EstablishmentCard from './EstablishmentCard';

const { width } = Dimensions.get('window');

interface EstablishmentSectionProps {
    title: string;
    establishments: Establishment[];
    onEstablishmentPress: (establishmentId: string) => void;
    onSeeAll?: () => void;
}

const EstablishmentSection: React.FC<EstablishmentSectionProps> = ({
    title,
    establishments,
    onEstablishmentPress,
    onSeeAll
}) => {
    if (!establishments || establishments.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onSeeAll && (
                    <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
                        <ArrowRightIcon width={width * 0.05} height={width * 0.05} fill="#1A1A2E" />
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollView}
            >
                {establishments.map((establishment, index) => (
                    <EstablishmentCard
                        key={`${establishment.id}-${index}`}
                        establishment={establishment}
                        onPress={() => onEstablishmentPress(establishment.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: width * 0.06,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: width * 0.03,
    },
    sectionTitle: {
        fontSize: width * 0.045,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
    },
    seeAllButton: {
        padding: width * 0.01,
    },
    horizontalScrollView: {},
});

export default EstablishmentSection;