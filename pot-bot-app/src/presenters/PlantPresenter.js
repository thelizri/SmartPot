import {Link } from "react-router-dom";
import {useAuth, readUserData, hasPlants} from "../firebaseModel";
import React, {useEffect, useState} from "react";
import PlantView from "../views/PlantView";
import AddPlantView from "../views/AddPlantView";

export default function PlantPresenter() {
    const [plantss, setPlants] = useState([])
    const {user} = useAuth();
    const getPlants = readUserData(user,"plants");
    //console.log(getPlants)
    let hasPlantPromise = hasPlants(user);
    const [hasPlant, setPlantBool] = useState(false);
    hasPlantPromise.then((v) => {
        console.log(v + " hasPlantPromise");
        setPlantBool(v);
    }).catch(err => console.error(err));
    console.log(hasPlant)

    return (

            <div>
                {hasPlant? <PlantView plants={getPlants} /> : <AddPlantView/>}
            </div>

    )

}