import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritosScreen() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>Favoritos</ThemedText>
      </ThemedView>
      {favorites.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Nenhum Pokémon favoritado ainda.</ThemedText>
        </ThemedView>
      ) : (
        favorites.map((poke) => (
          <ThemedView key={poke.name} style={styles.pokeCard}>
            <Image source={{ uri: poke.image }} style={styles.pokeImage} />
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle" style={styles.pokeName}>{poke.name}</ThemedText>
              <ThemedText style={styles.pokeTypes}>{poke.types.join(', ')}</ThemedText>
            </View>
            <Pressable onPress={() => removeFavorite(poke.name)}>
              <Ionicons name="heart" size={28} color="#e74c3c" style={{ marginLeft: 8 }} />
            </Pressable>
          </ThemedView>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#b0b0b0',
    fontSize: 18,
  },
  pokeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pokeImage: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  pokeName: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  pokeTypes: {
    color: '#4a90e2',
    fontSize: 16,
  },
}); 