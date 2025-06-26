import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { clearCache, getCacheStats, getLastSync } from '../services/firestoreService';

const { width } = Dimensions.get('window');

interface CacheStatsModalProps {
    visible: boolean;
    onClose: () => void;
}

const CacheStatsModal: React.FC<CacheStatsModalProps> = ({ visible, onClose }) => {
    const { isConnected } = useNetworkStatus();
    const [stats, setStats] = useState({
        lastSync: null as Date | null,
        establishmentsCount: 0,
        categoriesCount: 0,
        locationsCount: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadStats();
        }
    }, [visible]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [cacheStats, lastSync] = await Promise.all([
                getCacheStats(),
                getLastSync()
            ]);

            setStats({
                lastSync,
                establishmentsCount: cacheStats.establishmentsCount,
                categoriesCount: cacheStats.categoriesCount,
                locationsCount: cacheStats.locationsCount
            });
        } catch (error) {
            console.error('❌ Error loading cache stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            'Limpar Cache',
            'Tem certeza que deseja limpar todos os dados em cache? Você precisará estar online para recarregar os dados.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCache();
                            setStats({
                                lastSync: null,
                                establishmentsCount: 0,
                                categoriesCount: 0,
                                locationsCount: 0
                            });
                            Alert.alert('Sucesso', 'Cache limpo com sucesso!');
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao limpar cache');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return 'Nunca';

        return date.toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCacheSize = (count: number, type: string): string => {
        if (count === 0) return `Nenhum ${type} em cache`;
        if (count === 1) return `1 ${type} em cache`;
        return `${count} ${type} em cache`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cache Offline</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Connection Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Estado da Ligação</Text>
                        <View style={[
                            styles.statusCard,
                            isConnected ? styles.onlineCard : styles.offlineCard
                        ]}>
                            <View style={[
                                styles.statusIndicator,
                                isConnected ? styles.onlineIndicator : styles.offlineIndicator
                            ]} />
                            <Text style={[
                                styles.statusText,
                                isConnected ? styles.onlineText : styles.offlineText
                            ]}>
                                {isConnected ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>

                    {/* Last Sync */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Última Sincronização</Text>
                        <Text style={styles.lastSyncText}>
                            {formatDate(stats.lastSync)}
                        </Text>
                    </View>

                    {/* Cache Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados em Cache</Text>

                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Estabelecimentos:</Text>
                            <Text style={styles.statValue}>
                                {formatCacheSize(stats.establishmentsCount, 'estabelecimento')}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Categorias:</Text>
                            <Text style={styles.statValue}>
                                {formatCacheSize(stats.categoriesCount, 'categoria')}
                            </Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Localizações:</Text>
                            <Text style={styles.statValue}>
                                {formatCacheSize(stats.locationsCount, 'localização')}
                            </Text>
                        </View>
                    </View>

                    {/* Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Como Funciona</Text>
                        <Text style={styles.infoText}>
                            • Quando está online, os dados são carregados da internet e guardados em cache{'\n'}
                            • Quando está offline, a app usa os dados guardados{'\n'}
                            • O cache expira após 24 horas{'\n'}
                            • Pode fazer pesquisas mesmo offline nos dados guardados
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={loadStats}
                            disabled={loading}
                        >
                            <Text style={styles.refreshButtonText}>
                                {loading ? 'A carregar...' : 'Atualizar Estatísticas'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClearCache}
                        >
                            <Text style={styles.clearButtonText}>Limpar Cache</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.04,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: width * 0.05,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
    },
    closeButton: {
        paddingVertical: width * 0.01,
        paddingHorizontal: width * 0.02,
    },
    closeButtonText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#007AFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.04,
    },
    section: {
        backgroundColor: 'white',
        marginVertical: width * 0.02,
        padding: width * 0.04,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginBottom: width * 0.03,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 0.03,
        borderRadius: 8,
    },
    onlineCard: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    offlineCard: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    statusIndicator: {
        width: width * 0.03,
        height: width * 0.03,
        borderRadius: width * 0.015,
        marginRight: width * 0.02,
    },
    onlineIndicator: {
        backgroundColor: '#4CAF50',
    },
    offlineIndicator: {
        backgroundColor: '#FF9800',
    },
    statusText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
    },
    onlineText: {
        color: '#4CAF50',
    },
    offlineText: {
        color: '#FF9800',
    },
    lastSyncText: {
        fontSize: width * 0.036,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: width * 0.02,
    },
    statLabel: {
        fontSize: width * 0.036,
        fontFamily: 'EuclidSquare-Regular',
        color: '#333',
    },
    statValue: {
        fontSize: width * 0.036,
        fontFamily: 'EuclidSquare-Medium',
        color: '#666',
    },
    infoText: {
        fontSize: width * 0.034,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        lineHeight: width * 0.05,
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        paddingVertical: width * 0.03,
        borderRadius: 8,
        marginBottom: width * 0.02,
    },
    refreshButtonText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: 'white',
        textAlign: 'center',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: width * 0.03,
        borderRadius: 8,
    },
    clearButtonText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: 'white',
        textAlign: 'center',
    },
});

export default CacheStatsModal;