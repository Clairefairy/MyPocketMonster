import React, { createContext, useContext, useState, ReactNode } from 'react';

type Pokemon = {
  name: string;
  image: string;
  types: string[];
};

type FavoritesContextType = {
  favorites: Pokemon[];
  addFavorite: (pokemon: Pokemon) => void;
  removeFavorite: (pokemonName: string) => void;
  isFavorite: (pokemonName: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Pokemon[]>([]);

  const addFavorite = (pokemon: Pokemon) => {
    setFavorites(prev => [...prev, pokemon]);
  };

  const removeFavorite = (pokemonName: string) => {
    setFavorites(prev => prev.filter(p => p.name !== pokemonName));
  };

  const isFavorite = (pokemonName: string) => {
    return favorites.some(p => p.name === pokemonName);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 