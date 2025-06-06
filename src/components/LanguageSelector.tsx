import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface LanguageSelectorProps {
    currentLanguage: 'pt' | 'en';
    changingLanguage: boolean;
    onLanguageChange: (language: 'pt' | 'en') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    currentLanguage,
    changingLanguage,
    onLanguageChange
}) => {
    const LanguageOption = ({
        language,
        flag,
        label
    }: {
        language: 'pt' | 'en';
        flag: string;
        label: string;
    }) => (
        <TouchableOpacity
            style={[
                styles.languageOption,
                currentLanguage === language && styles.languageOptionActive
            ]}
            onPress={() => onLanguageChange(language)}
            disabled={changingLanguage}
        >
            <View style={styles.languageContent}>
                <Text style={styles.languageFlag}>{flag}</Text>
                <Text style={[
                    styles.languageLabel,
                    currentLanguage === language && styles.languageLabelActive
                ]}>
                    {label}
                </Text>
            </View>

            {currentLanguage === language && (
                <View style={styles.checkIconContainer}>
                    {changingLanguage ? (
                        <ActivityIndicator size="small" color="#E8A756" />
                    ) : (
                        <View style={styles.checkIcon}>
                            <Text style={styles.checkMark}>✓</Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.languageContainer}>
            <LanguageOption language="pt" flag="🇵🇹" label="Português" />
            <LanguageOption language="en" flag="🇬🇧" label="English" />
        </View>
    );
};

const styles = StyleSheet.create({
    languageContainer: {
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.04,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    languageOptionActive: {
        backgroundColor: '#FFF8E7',
        borderBottomColor: '#E8A756',
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlag: {
        fontSize: width * 0.06,
        marginRight: width * 0.03,
    },
    languageLabel: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
    },
    languageLabelActive: {
        color: '#B8860B',
        fontFamily: 'EuclidSquare-SemiBold',
    },
    checkIconContainer: {
        marginLeft: width * 0.02,
    },
    checkIcon: {
        width: width * 0.06,
        height: width * 0.06,
        borderRadius: width * 0.03,
        backgroundColor: '#E8A756',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMark: {
        color: '#FFFFFF',
        fontSize: width * 0.035,
        fontWeight: 'bold',
    },
});

export default LanguageSelector;