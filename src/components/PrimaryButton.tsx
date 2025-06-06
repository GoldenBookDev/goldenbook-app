import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    backgroundColor?: string;
    textColor?: string;
    style?: any;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    backgroundColor = '#E8A756',
    textColor = '#FFFFFF',
    style
}) => {
    return (
        <TouchableOpacity
            style={[
                primaryButtonStyles.button,
                { backgroundColor },
                (disabled || loading) && primaryButtonStyles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <Text style={[primaryButtonStyles.buttonText, { color: textColor }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const primaryButtonStyles = StyleSheet.create({
    button: {
        borderRadius: 8,
        paddingVertical: width * 0.035,
        alignItems: 'center',
        minHeight: width * 0.12,
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default PrimaryButton;