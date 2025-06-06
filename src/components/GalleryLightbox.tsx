import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';

const { width, height } = Dimensions.get('window');

interface GalleryLightboxProps {
    visible: boolean;
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
    visible,
    images,
    currentIndex,
    onClose,
    onPrevious,
    onNext
}) => {
    if (!visible || images.length === 0) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={lightboxStyles.lightboxContainer}>
                <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />

                {/* Botón de cerrar */}
                <TouchableOpacity style={lightboxStyles.lightboxCloseButton} onPress={onClose}>
                    <Text style={lightboxStyles.lightboxCloseText}>✕</Text>
                </TouchableOpacity>

                {/* Imagen actual */}
                <Image
                    source={{ uri: images[currentIndex] }}
                    style={lightboxStyles.lightboxImage}
                    resizeMode="contain"
                />

                {/* Botón anterior */}
                {images.length > 1 && (
                    <TouchableOpacity style={lightboxStyles.lightboxPrevButton} onPress={onPrevious}>
                        <ArrowLeftIcon width={40} height={40} fill="#FFFFFF" />
                    </TouchableOpacity>
                )}

                {/* Botón siguiente */}
                {images.length > 1 && (
                    <TouchableOpacity style={lightboxStyles.lightboxNextButton} onPress={onNext}>
                        <ArrowLeftIcon
                            width={40}
                            height={40}
                            fill="#FFFFFF"
                            style={{ transform: [{ rotate: '180deg' }] }}
                        />
                    </TouchableOpacity>
                )}

                {/* Indicador de posición */}
                {images.length > 1 && (
                    <View style={lightboxStyles.lightboxIndicator}>
                        <Text style={lightboxStyles.lightboxIndicatorText}>
                            {currentIndex + 1} / {images.length}
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const lightboxStyles = StyleSheet.create({
    lightboxContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxImage: {
        width: width * 0.95,
        height: height * 0.7,
    },
    lightboxCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 15,
    },
    lightboxCloseText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    lightboxPrevButton: {
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: [{ translateY: -20 }],
        padding: 10,
    },
    lightboxNextButton: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -20 }],
        padding: 10,
    },
    lightboxIndicator: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    lightboxIndicatorText: {
        color: '#FFFFFF',
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Medium',
    },
});

export default GalleryLightbox;