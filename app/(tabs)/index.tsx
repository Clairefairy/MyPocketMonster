import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, ScrollView, ActivityIndicator, Pressable, View } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFavorites } from '@/context/FavoritesContext';

interface PokemonData {
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  forms: Array<{
    name: string;
    url: string;
  }>;
}

interface PokemonSuggestion {
  name: string;
  url: string;
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<Array<{name: string, url: string}>>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchText.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        
        const filteredSuggestions = data.results
          .filter((pokemon: PokemonSuggestion) =>
            pokemon.name.toLowerCase().includes(searchText.toLowerCase())
          )
          .slice(0, 5);

        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const fetchPokemonForms = async (pokemonName: string) => {
    try {
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
      const speciesData = await speciesResponse.json();
      
      if (speciesData.varieties.length > 1) {
        const forms = speciesData.varieties
          .filter((variety: any) => variety.pokemon.name !== pokemonName)
          .map((variety: any) => ({
            name: variety.pokemon.name,
            url: variety.pokemon.url
          }));
        setAvailableForms(forms);
      } else {
        setAvailableForms([]);
      }
    } catch (error) {
      console.error('Erro ao buscar formas:', error);
      setAvailableForms([]);
    }
  };

  const searchPokemon = async (pokemonName: string, formUrl?: string) => {
    if (!pokemonName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const url = formUrl || `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Pokémon não encontrado');
      
      const data = await response.json();
      setPokemon(data);
      setSelectedForm(formUrl ? pokemonName : null);
      
      // Buscar formas disponíveis
      if (!formUrl) {
        await fetchPokemonForms(pokemonName);
      }
    } catch (err) {
      setError('Erro ao buscar Pokémon. Tente novamente.');
      setPokemon(null);
      setAvailableForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (pokemonName: string) => {
    setSearchText(pokemonName);
    searchPokemon(pokemonName);
  };

  const handleFormPress = async (formName: string, formUrl: string) => {
    setSelectedForm(formName);
    await searchPokemon(formName, formUrl);
  };

  const toggleFavorite = () => {
    if (!pokemon) return;

    const pokemonData = {
      name: pokemon.name,
      image: pokemon.sprites.other['official-artwork'].front_default,
      types: pokemon.types.map(type => type.type.name),
    };

    if (isFavorite(pokemon.name)) {
      removeFavorite(pokemon.name);
    } else {
      addFavorite(pokemonData);
    }
  };

  const handlePressOutside = () => {
    setShowSuggestions(false);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ color: '#4a90e2' }}>Busca por Pokémon</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o nome do Pokémon"
          placeholderTextColor="#95a5a6"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (text.length >= 2) {
              setShowSuggestions(true);
            } else {
              setShowSuggestions(false);
            }
          }}
          onSubmitEditing={() => {
            searchPokemon(searchText);
            setShowSuggestions(false);
          }}
          returnKeyType="search"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ThemedView style={styles.suggestionsContainer}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.name}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion.name)}
              >
                <ThemedText style={styles.suggestionText}>
                  {suggestion.name.charAt(0).toUpperCase() + suggestion.name.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      {showSuggestions && (
        <Pressable
          style={styles.overlay}
          onPress={handlePressOutside}
        />
      )}

      {loading && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
        </ThemedView>
      )}

      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {pokemon && (
        <ThemedView style={styles.pokemonContainer}>
          <Pressable style={styles.favoriteButton} onPress={toggleFavorite} hitSlop={10}>
            <Ionicons
              name={isFavorite(pokemon.name) ? 'heart' : 'heart-outline'}
              size={32}
              color={isFavorite(pokemon.name) ? '#e74c3c' : '#b0b0b0'}
            />
          </Pressable>
          <Image
            source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
            style={styles.pokemonImage}
          />
          
          <ThemedText type="subtitle" style={styles.pokemonName}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </ThemedText>

          {availableForms.length > 0 && (
            <ThemedView style={styles.formsContainer}>
              <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Formas Disponíveis:</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formsScroll}>
                {availableForms.map((form) => (
                  <Pressable
                    key={form.name}
                    style={[
                      styles.formButton,
                      selectedForm === form.name && styles.selectedFormButton
                    ]}
                    onPress={() => handleFormPress(form.name, form.url)}
                  >
                    <ThemedText style={[
                      styles.formButtonText,
                      selectedForm === form.name && styles.selectedFormButtonText
                    ]}>
                      {form.name.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          <ThemedView style={styles.infoContainer}>
            <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Tipos:</ThemedText>
            <ThemedText style={{ color: '#2c3e50' }}>
              {pokemon.types.map(type => type.type.name).join(', ')}
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Habilidades:</ThemedText>
            <ThemedText style={{ color: '#2c3e50' }}>
              {pokemon.abilities.map(ability => ability.ability.name).join(', ')}
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Estatísticas:</ThemedText>
            {pokemon.stats.map((stat, index) => (
              <ThemedText key={index} style={{ color: '#2c3e50' }}>
                {stat.stat.name}: {stat.base_stat}
              </ThemedText>
            ))}

            <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Altura:</ThemedText>
            <ThemedText style={{ color: '#2c3e50' }}>{pokemon.height / 10}m</ThemedText>

            <ThemedText type="defaultSemiBold" style={{ color: '#4a90e2' }}>Peso:</ThemedText>
            <ThemedText style={{ color: '#2c3e50' }}>{pokemon.weight / 10}kg</ThemedText>
          </ThemedView>
        </ThemedView>
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
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  searchContainer: {
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2c3e50',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  pokemonContainer: {
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  pokemonImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 28,
    marginBottom: 20,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoContainer: {
    width: '100%',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  formsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  formsScroll: {
    marginTop: 8,
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  selectedFormButton: {
    backgroundColor: '#4a90e2',
  },
  formButtonText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  selectedFormButtonText: {
    color: '#ffffff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});
