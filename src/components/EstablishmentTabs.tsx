import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

type TabType = 'Overview' | 'Contacts' | 'Reservations';

interface EstablishmentTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const EstablishmentTabs: React.FC<EstablishmentTabsProps> = ({ activeTab, onTabChange }) => {
    const getTabText = (tab: string) => {
        switch (tab) {
            case 'Overview':
                return i18n.t('establishment.overview');
            case 'Contacts':
                return i18n.t('establishment.contacts');
            case 'Reservations':
                return i18n.t('establishment.reservations');
            default:
                return tab;
        }
    };

    return (
        <View style={styles.tabContainer}>
            {['Overview', 'Contacts', 'Reservations'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === tab && styles.activeTab
                    ]}
                    onPress={() => onTabChange(tab as TabType)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText
                        ]}
                    >
                        {getTabText(tab)}
                    </Text>
                    {activeTab === tab && (
                        <View style={styles.activeTabIndicator}>
                            <View style={styles.activeTabLine} />
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        position: 'relative',
    },
    tabText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#999999',
    },
    activeTab: {
        borderBottomColor: '#DAA520',
    },
    activeTabText: {
        color: '#1A1A2E',
        fontFamily: 'EuclidSquare-Medium',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 3,
        alignItems: 'center',
    },
    activeTabLine: {
        width: '50%',
        height: 3,
        backgroundColor: '#DAA520',
    },
});

export default EstablishmentTabs;