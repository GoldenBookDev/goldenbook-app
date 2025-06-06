import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    onButtonPress: () => void;
    buttonColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    buttonText,
    onButtonPress,
    buttonColor = '#DAA520'
}) => {
    return (
        <View style={emptyStateStyles.emptyStateContainer}>
            {icon && (
                <View style={emptyStateStyles.emptyStateIconContainer}>
                    {icon}
                </View>
            )}
            <Text style={emptyStateStyles.emptyStateTitle}>{title}</Text>
            <Text style={emptyStateStyles.emptyStateDescription}>{description}</Text>
            <TouchableOpacity
                style={[emptyStateStyles.actionButton, { backgroundColor: buttonColor }]}
                onPress={onButtonPress}
            >
                <Text style={emptyStateStyles.actionButtonText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const emptyStateStyles = StyleSheet.create({
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.08,
    },
    emptyStateIconContainer: {
        marginBottom: width * 0.04,
    },
    emptyStateTitle: {
        fontSize: width * 0.05,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: width * 0.02,
    },
    emptyStateDescription: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: width * 0.055,
        marginBottom: width * 0.06,
    },
    actionButton: {
        paddingHorizontal: width * 0.08,
        paddingVertical: width * 0.035,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
    },
});

export default EmptyState;