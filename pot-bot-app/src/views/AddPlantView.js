import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import plantSource from '../services/plantSource';
import {ThreeDots} from 'react-loader-spinner'
import '../styling/AddPlant.css'
import { get, ref } from "firebase/database";
import { db } from "../firebaseModel";
import { searchPlants, fetchPlantDetails } from "../services/plantSource";

/*TODO:Flytta konstanter till presenter från app */

const isIDValid = (id) => {
  const plantRef = ref(db, `plants/${id}`);
  return get(plantRef)
    .then((snapshot) => {
      return snapshot.exists();
    })
    .catch((error) => {
      console.error("Error checking ID validity:", error);
      return false;
    });
};

export default function AddPlantView({ addPlantToPersonalList }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedPlantId, setExpandedPlantId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef();
  const loaderRef = useRef();

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePlantClick = (plantId) => {
    if (expandedPlantId === plantId) {
      setExpandedPlantId(null);
    } else {
      setExpandedPlantId(plantId);
    }
  };

  const handleAddPlantButtonClick = (plant) => {
    const plantDataWithImage = {
      ...plant,
      imageURL: plant.default_image.regular_url,
    };
    addPlantToPersonalList(plantDataWithImage);
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const result = await searchPlants(searchTerm);
  //   console.log("Search Results:", result);
  //   if (result && result.length > 0) {
  //     const validIDs = result.filter((plant) => isIDValid(plant.id));
  //     const plantDetails = await Promise.all(
  //       validIDs.map((plant) => fetchPlantDetails(plant.id))
  //     );
  //     console.log("Plant Details:", plantDetails);
  //     setSearchResults(plantDetails);
  //     setIsLoading(true);
  //   } else {
  //     setSearchResults([]);
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await searchPlants(searchTerm);
    console.log("Search Results:", result);
    if (result && result.length > 0) {
      setSearchResults(result);
      setIsLoading(true);
    } else {
      setSearchResults([]);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    const results = await searchPlants(searchTerm, nextPage);
    setCurrentPage(nextPage);
    const validIDs = results.filter((plant) => isIDValid(plant.id));
    const plantDetails = await Promise.all(
      validIDs.map((plant) => fetchPlantDetails(plant.id))
    );
    setSearchResults((prevResults) => [...prevResults, ...plantDetails]);
    setIsFetchingMore(false);
  };
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };
  
    const observerCallback = (entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isFetchingMore) {
        setIsFetchingMore(true);
      }
    };
  
    const observer = new IntersectionObserver(observerCallback, observerOptions);
  
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
  
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [isFetchingMore]);
  
  useEffect(() => {
    if (observer.current && searchResults.length > 0) {
      observer.current.observe(loaderRef.current);
    }
  }, [searchResults]);

  return (
    <div className="addPlant">
      <div className="addPlantDescr">
        <h2>Connect your plant to the PotBot</h2>
        <p>First choose what kind of plant you have and we will calibrate the optimal conditions for it</p>
      </div>
      <form className="plant-form" onSubmit={handleSubmit}>
        <input
          className="api-search"
          type="text"
          placeholder="Choose your plant"
          value={searchTerm}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
        <Link to="/home">
          <button className="back-btn">Back to your plants</button>
        </Link>
      </form>
      <div className="search-results-grid">
      {searchResults.map((plant, index) => (
  <div
    className="plant-card"
    key={plant.id}
    onClick={() => handlePlantClick(plant.id)}
  >
    <div key={plant.id}>
      {plant.default_image && (
        <img
          src={plant.default_image.regular_url}
          alt={plant.common_name}
          width="100"
          height="100"
        />
      )}
      <p>{plant.common_name}</p>
    </div>
    {expandedPlantId === plant.id && (
      <div className="plant-dropdown">
        <button
          className="add-plant-button"
          onClick={() => handleAddPlantButtonClick(plant)}
        >
          Add to my plants
        </button>
      </div>
    )}
    {index === searchResults.length - 1 && !isLoading && (
      <div className="load-more" ref={loaderRef}>
        Load More
      </div>
    )}
    {isLoading && (
      <div className="loading">
        <ThreeDots type="ThreeDots" color="#2BAD60" height={40} width={40} />
      </div>
    )}
  </div>
))}
      </div>
    </div>
  );
}