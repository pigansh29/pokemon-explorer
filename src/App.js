import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchPokemonTypes = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/type");
        const data = await response.json();
        // Filter out non-standard types
        const standardTypes = data.results
          .filter((type) => !["unknown", "shadow"].includes(type.name))
          .map((type) => type.name);
        setTypes(standardTypes);
      } catch (err) {
        console.error("Error fetching Pokémon types:", err);
      }
    };

    fetchPokemonTypes();
  }, []);

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the first 150 Pokémon
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=150"
        );
        const data = await response.json();

        // Fetch detailed information for each Pokémon
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);
            return await detailResponse.json();
          })
        );

        // Format the data
        const formattedPokemon = pokemonDetails.map((p) => ({
          id: p.id,
          name: p.name,
          types: p.types.map((t) => t.type.name),
          image: p.sprites.front_default,
        }));

        setPokemon(formattedPokemon);
        setFilteredPokemon(formattedPokemon);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Pokémon data. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchPokemon();
  }, []);

  // Filter Pokémon based on search term and type filter
  useEffect(() => {
    const filtered = pokemon.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "" || p.types.includes(typeFilter);
      return matchesSearch && matchesType;
    });

    setFilteredPokemon(filtered);
  }, [searchTerm, typeFilter, pokemon]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Pokémon Explorer</h1>
      </header>

      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Pokémon by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="type-filter"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <p>Loading Pokémon data...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : filteredPokemon.length === 0 ? (
        <div className="no-results">
          <p>No Pokémon found matching your search criteria.</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {filteredPokemon.map((p) => (
            <PokemonCard key={p.id} pokemon={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PokemonCard({ pokemon }) {
  return (
    <div className="pokemon-card">
      <div className="pokemon-id">
        #{pokemon.id.toString().padStart(3, "0")}
      </div>
      <img src={pokemon.image} alt={pokemon.name} className="pokemon-image" />
      <h3 className="pokemon-name">
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </h3>
      <div className="pokemon-types">
        {pokemon.types.map((type) => (
          <span key={type} className={`type-badge ${type}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
