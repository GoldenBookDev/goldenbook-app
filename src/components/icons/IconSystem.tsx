// src/components/icons/SimpleIconSystem.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ============ INTERFACES SIMPLES ============
interface DropBackgroundProps {
    size?: number;
    color?: string;
}

interface CategoryIconProps {
    category: string;
    size?: number;
    iconSize?: number;
    iconColor?: string;
    backgroundColor?: string;
    type?: 'category' | 'subcategory';
    style?: ViewStyle;
}

interface UIIconProps {
    name: string;
    size?: number;
    color?: string;
    style?: ViewStyle;
}

// ============ FONDO EN FORMA DE GOTA ============
const DropBackground: React.FC<DropBackgroundProps> = ({
    size = 48,
    color = "#F8EDD2"
}) => (
    <Svg width={size} height={size} viewBox="0 0 48 48" style={StyleSheet.absoluteFillObject}>
        <Path
            d="M24 4C24 4 12 16 12 26C12 31.5228 17.4772 37 24 37C30.5228 37 36 31.5228 36 26C36 16 24 4 24 4Z"
            fill={color}
        />
    </Svg>
);

// ============ FUNCIÓN PARA OBTENER ICONO ============
const getIconConfig = (category: string, type: 'category' | 'subcategory' = 'category') => {
    // Categorías principales
    const categoryIcons: any = {
        culture: { lib: MaterialIcons, name: "account-balance" },
        gastronomy: { lib: MaterialIcons, name: "restaurant" },
        sports: { lib: MaterialIcons, name: "sports" },
        events: { lib: MaterialIcons, name: "event" },
        shops: { lib: MaterialIcons, name: "shopping-bag" },
        beaches: { lib: MaterialIcons, name: "beach-access" },
        transport: { lib: MaterialIcons, name: "directions" },
        activities: { lib: MaterialIcons, name: "local-activity" }
    };

    // Subcategorías
    const subcategoryIcons: any = {
        // Activities
        experiences: { lib: MaterialIcons, name: "star-outline" },
        health_wellness: { lib: MaterialIcons, name: "spa" },
        hotels: { lib: Ionicons, name: "bed-outline" },
        nightlife: { lib: MaterialIcons, name: "local-bar" },
        real_estate: { lib: MaterialIcons, name: "home-outline" },
        tours: { lib: MaterialIcons, name: "map" },

        // Nature
        gardens: { lib: MaterialIcons, name: "local-florist" },
        natural_reserves: { lib: MaterialIcons, name: "forest" },
        parks: { lib: MaterialIcons, name: "park" },
        viewpoints: { lib: MaterialIcons, name: "visibility" },
        waterfalls: { lib: MaterialIcons, name: "water-drop" },

        // Culture
        castles: { lib: FontAwesome5, name: "chess-rook" },
        churches: { lib: MaterialIcons, name: "church" },
        galleries: { lib: MaterialIcons, name: "palette" },
        historical_sites: { lib: MaterialIcons, name: "account-balance" },
        monuments: { lib: MaterialIcons, name: "monument" },
        museums: { lib: MaterialIcons, name: "museum" },

        // Events
        concerts: { lib: MaterialIcons, name: "music-note" },
        cultural_events: { lib: MaterialIcons, name: "event" },
        exhibitions: { lib: MaterialIcons, name: "art-track" },
        fairs: { lib: MaterialIcons, name: "festival" },
        festivals: { lib: MaterialIcons, name: "celebration" },
        sports_events: { lib: MaterialIcons, name: "sports" },

        // Food & Drinks
        bars: { lib: MaterialIcons, name: "local-bar" },
        cafes: { lib: MaterialIcons, name: "local-cafe" },
        local_markets: { lib: MaterialIcons, name: "storefront" },
        restaurants: { lib: MaterialIcons, name: "restaurant" },
        traditional_food: { lib: MaterialIcons, name: "restaurant-menu" },
        wineries: { lib: MaterialIcons, name: "wine-bar" },

        // Shopping
        antiques: { lib: MaterialIcons, name: "history" },
        crafts: { lib: MaterialIcons, name: "handyman" },
        decoration: { lib: MaterialIcons, name: "home-work" },
        fashion: { lib: MaterialIcons, name: "checkroom" },
        jewellery: { lib: MaterialIcons, name: "diamond" },
        local_shops: { lib: MaterialIcons, name: "store" },
        malls: { lib: MaterialIcons, name: "local-mall" },
        markets: { lib: MaterialIcons, name: "shopping-basket" },
        souvenirs: { lib: MaterialIcons, name: "card-giftcard" },
        traditional_shops: { lib: MaterialIcons, name: "store-mall-directory" },
        watches: { lib: MaterialIcons, name: "watch" },

        // Sports
        cycling: { lib: MaterialIcons, name: "directions-bike" },
        golf: { lib: MaterialIcons, name: "golf-course" },
        hiking: { lib: MaterialIcons, name: "hiking" },
        horse_riding: { lib: MaterialIcons, name: "pets" },
        surfing: { lib: MaterialIcons, name: "surfing" },
        water_sports: { lib: MaterialIcons, name: "kayaking" },

        // Transport
        airport: { lib: MaterialIcons, name: "flight" },
        boats: { lib: MaterialIcons, name: "directions-boat" },
        car_rental: { lib: MaterialIcons, name: "car-rental" }
    };

    const iconMap = type === 'subcategory' ? subcategoryIcons : categoryIcons;
    return iconMap[category] || null;
};

// ============ FUNCIÓN PARA ICONOS UI ============
const getUIIcon = (name: string) => {
    const uiIcons: any = {
        'arrow-left-bg': { lib: MaterialIcons, name: "arrow-back" },
        'menu-bg': { lib: MaterialIcons, name: "menu" },
        'land-layer-location': { lib: MaterialIcons, name: "map" },
        search: { lib: MaterialIcons, name: "search" },
        close: { lib: MaterialIcons, name: "close" },
        favorite: { lib: MaterialIcons, name: "favorite-outline" },
        share: { lib: MaterialIcons, name: "share" },
        phone: { lib: MaterialIcons, name: "phone" },
        website: { lib: MaterialIcons, name: "language" },
        location: { lib: MaterialIcons, name: "location-on" },
        star: { lib: MaterialIcons, name: "star" },
        'star-outline': { lib: MaterialIcons, name: "star-outline" }
    };

    return uiIcons[name] || null;
};

// ============ COMPONENTES ============

// Icono con fondo de gota
export const CategoryIcon: React.FC<CategoryIconProps> = ({
    category,
    size = 48,
    iconSize = 24,
    iconColor = "#915A17",
    backgroundColor = "#F8EDD2",
    type = "category",
    style = {}
}) => {
    const iconConfig = getIconConfig(category, type);

    if (!iconConfig) {
        return (
            <View style={[styles.container, { width: size, height: size }, style]}>
                <DropBackground size={size} color={backgroundColor} />
                <MaterialIcons name="help-outline" size={iconSize} color={iconColor} />
            </View>
        );
    }

    const IconComponent = iconConfig.lib;

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            <DropBackground size={size} color={backgroundColor} />
            <IconComponent name={iconConfig.name} size={iconSize} color={iconColor} />
        </View>
    );
};

// Icono simple de UI
export const UIIcon: React.FC<UIIconProps> = ({
    name,
    size = 24,
    color = "#000",
    style = {}
}) => {
    const iconConfig = getUIIcon(name);

    if (!iconConfig) {
        return <MaterialIcons name="help-outline" size={size} color={color} style={style} />;
    }

    const IconComponent = iconConfig.lib;
    return <IconComponent name={iconConfig.name} size={size} color={color} style={style} />;
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    }
});

export default {
    CategoryIcon,
    UIIcon
};