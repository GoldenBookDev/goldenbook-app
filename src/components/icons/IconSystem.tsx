// src/components/icons/IconSystem.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ============ IMPORTAR SVG PERSONALIZADOS ============
// Deportes
import HorseHeadIcon from '../../assets/images/icons/horse-head.svg';
import SurfboardIcon from '../../assets/images/icons/surfboard.svg';
import WindSurfIcon from '../../assets/images/icons/wind-surf.svg';

// Naturaleza
import ForestIcon from '../../assets/images/icons/forest.svg';
import LandscapeIcon from '../../assets/images/icons/landscape.svg';

// Cultura
import CastleIcon from '../../assets/images/icons/castle.svg';
import ChurchIcon from '../../assets/images/icons/church.svg';
import HistoryIcon from '../../assets/images/icons/history.svg';
import MuseumIcon from '../../assets/images/icons/museum.svg';
import PantheonIcon from '../../assets/images/icons/pantheon.svg';

// Gastronomía
import PotIcon from '../../assets/images/icons/pot.svg';
import WineryIcon from '../../assets/images/icons/winery.svg';

// ============ INTERFACES ============
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
            d="M24 44C24 44 12 32 12 22C12 16.4772 17.4772 11 24 11C30.5228 11 36 16.4772 36 22C36 32 24 44 24 44Z"
            fill={color}
        />
    </Svg>
);

// ============ COMPONENTE SVG PERSONALIZADO ============
const CustomSVGIcon: React.FC<{
    SvgComponent: React.ComponentType<any>;
    size: number;
    color: string;
}> = ({ SvgComponent, size, color }) => (
    <SvgComponent
        width={size}
        height={size}
        fill={color}
        stroke={color}
        strokeWidth={1.5} // ✅ Grosor consistente
        style={{
            maxWidth: size,
            maxHeight: size
        }}
    />
);

// ============ MAPEO DE ICONOS PERSONALIZADOS ============
const customIconsMapping: { [key: string]: React.ComponentType<any> } = {
    // Deportes
    'surfing': SurfboardIcon,
    'horse_riding': HorseHeadIcon,
    'water_sports': WindSurfIcon,

    // Naturaleza  
    'natural_reserves': ForestIcon,
    'viewpoints': LandscapeIcon,

    // Cultura
    'museums': MuseumIcon,
    'historical_sites': HistoryIcon,
    'monuments': PantheonIcon,
    'churches': ChurchIcon,
    'castles': CastleIcon,

    // Gastronomía
    'traditional_food': PotIcon,
    'wineries': WineryIcon,
};

// ✅ Helper para iconos UI 
const getUIIcon = (name: string) => {
    const uiIcons: any = {
        'arrow-left-bg': { lib: MaterialIcons, name: "arrow-back" },
        'menu-bg': { lib: MaterialIcons, name: "menu" },
        'land-layer-location': { lib: MaterialIcons, name: "map" },
        search: { lib: Ionicons, name: "search-outline" },
        close: { lib: Ionicons, name: "close-outline" },
        favorite: { lib: Ionicons, name: "heart-outline" },
        love: { lib: Ionicons, name: "heart-outline" },
        share: { lib: Ionicons, name: "share-outline" },
        phone: { lib: Ionicons, name: "call-outline" },
        website: { lib: Ionicons, name: "globe-outline" },
        location: { lib: Ionicons, name: "location-outline" },
        star: { lib: Ionicons, name: "star" },
        'star-outline': { lib: Ionicons, name: "star-outline" },
        thumb: { lib: Ionicons, name: "thumbs-up-outline" }, // ✅ THUMB ICON
        send: { lib: Ionicons, name: "send-outline" },
        mail: { lib: Ionicons, name: "mail-outline" },
        time: { lib: Ionicons, name: "time-outline" },
        login: { lib: Ionicons, name: "log-in-outline" },
        user: { lib: Ionicons, name: "person-outline" },
        'arrow-right': { lib: Ionicons, name: "arrow-forward-outline" },
        'arrow-right-bg': { lib: MaterialIcons, name: "arrow-forward" },
        settings: { lib: Ionicons, name: "settings-outline" },
        logout: { lib: Ionicons, name: "log-out-outline" },
    };

    return uiIcons[name] || null;
};

// ============ FUNCIÓN PARA OBTENER ICONO ============
const getIconConfig = (category: string, type: 'category' | 'subcategory' = 'category') => {

    // ✅ VERIFICAR SI ES UN ICONO PERSONALIZADO (SVG)
    if (customIconsMapping[category]) {
        return {
            type: 'custom',
            component: customIconsMapping[category],
            fallback: { lib: Ionicons, name: "help-outline" }
        };
    }

    // ✅ VERIFICAR SI ES UN ICONO UI (como thumb, favorite, etc.)
    const uiIconConfig = getUIIcon(category);
    if (uiIconConfig) {
        return uiIconConfig;
    }

    // Categorías principales (iconos Ionicons)
    const categoryIcons: any = {
        activities: { lib: Ionicons, name: "play-outline" },
        beaches: { lib: Ionicons, name: "sunny-outline" },
        culture: { lib: Ionicons, name: "library-outline" },
        events: { lib: Ionicons, name: "calendar-outline" },
        gastronomy: { lib: Ionicons, name: "restaurant-outline" },
        shops: { lib: Ionicons, name: "bag-outline" },
        sports: { lib: Ionicons, name: "fitness-outline" },
        transport: { lib: Ionicons, name: "car-outline" }
    };

    // Subcategorías (Ionicons para las que no tienen SVG personalizado)
    const subcategoryIcons: any = {
        // Activities
        experiences: { lib: Ionicons, name: "star-outline" },
        health_wellness: { lib: Ionicons, name: "flower-outline" },
        hotels: { lib: Ionicons, name: "bed-outline" },
        nightlife: { lib: Ionicons, name: "wine-outline" },
        real_estate: { lib: Ionicons, name: "home-outline" },
        tours: { lib: Ionicons, name: "map-outline" },

        // Nature (las que no tienen SVG personalizado)
        gardens: { lib: Ionicons, name: "leaf-outline" },
        parks: { lib: Ionicons, name: "footsteps-outline" },
        waterfalls: { lib: Ionicons, name: "water-outline" },

        // Culture (las que no tienen SVG personalizado)  
        galleries: { lib: Ionicons, name: "image-outline" },

        // Events
        concerts: { lib: Ionicons, name: "musical-notes-outline" },
        cultural_events: { lib: Ionicons, name: "calendar-outline" },
        exhibitions: { lib: Ionicons, name: "easel-outline" },
        fairs: { lib: Ionicons, name: "balloon-outline" },
        festivals: { lib: Ionicons, name: "happy-outline" },
        sports_events: { lib: Ionicons, name: "trophy-outline" },

        // Food & Drinks (las que no tienen SVG personalizado)
        bars: { lib: Ionicons, name: "wine-outline" },
        cafes: { lib: Ionicons, name: "cafe-outline" },
        local_markets: { lib: Ionicons, name: "storefront-outline" },
        restaurants: { lib: Ionicons, name: "restaurant-outline" },

        // Shopping
        antiques: { lib: Ionicons, name: "time-outline" },
        crafts: { lib: Ionicons, name: "hammer-outline" },
        decoration: { lib: Ionicons, name: "brush-outline" },
        fashion: { lib: Ionicons, name: "shirt-outline" },
        jewellery: { lib: Ionicons, name: "diamond-outline" },
        local_shops: { lib: Ionicons, name: "storefront-outline" },
        malls: { lib: Ionicons, name: "business-outline" },
        markets: { lib: Ionicons, name: "basket-outline" },
        souvenirs: { lib: Ionicons, name: "gift-outline" },
        traditional_shops: { lib: Ionicons, name: "bag-outline" },
        watches: { lib: Ionicons, name: "watch-outline" },

        // Sports (las que no tienen SVG personalizado)
        cycling: { lib: Ionicons, name: "bicycle-outline" },
        golf: { lib: Ionicons, name: "golf-outline" },
        hiking: { lib: Ionicons, name: "walk-outline" },

        // Transport
        airport: { lib: Ionicons, name: "airplane-outline" },
        boats: { lib: Ionicons, name: "boat-outline" },
        car_rental: { lib: Ionicons, name: "car-outline" }
    };

    const iconMap = type === 'subcategory' ? subcategoryIcons : categoryIcons;
    const result = iconMap[category] || { lib: Ionicons, name: "help-outline" };

    return result;
};

// ============ COMPONENTE PRINCIPAL ============
export const CategoryIcon: React.FC<CategoryIconProps> = ({
    category,
    size = 48,
    iconSize = 24,
    iconColor = "#915A17",
    backgroundColor = "#F8EDD2",
    type = "category",
    style = {}
}) => {
    // Validación de entrada
    let categoryString = category;
    if (typeof category === 'function') {
        categoryString = 'culture';
    }


    const iconConfig = getIconConfig(categoryString, type);

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            {/* ✅ FONDO DE GOTA SIEMPRE PRESENTE */}
            <DropBackground size={size} color={backgroundColor} />

            {/* ✅ RENDERIZAR ICONO SEGÚN TIPO */}
            {iconConfig.type === 'custom' ? (
                // SVG Personalizado
                <CustomSVGIcon
                    SvgComponent={iconConfig.component}
                    size={iconSize}
                    color={iconColor}
                />
            ) : iconConfig.lib ? (
                // Ionicons/MaterialIcons
                (() => {
                    const IconComponent = iconConfig.lib;
                    return <IconComponent name={iconConfig.name} size={iconSize} color={iconColor} />;
                })()
            ) : (
                // Fallback
                <Ionicons name="help-outline" size={iconSize} color={iconColor} />
            )}
        </View>
    );
};

// ✅ COMPONENTE UI ICON (SIN GOTA DE FONDO)
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