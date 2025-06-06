import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

interface SecondaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: any;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style
}) => {
    return (
        <TouchableOpacity
            style={[
                secondaryButtonStyles.button,
                disabled && secondaryButtonStyles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={secondaryButtonStyles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const secondaryButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingVertical: width * 0.035,
        alignItems: 'center',
        minHeight: width * 0.12,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#1A1A2E',
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default SecondaryButton;
