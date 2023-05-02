import {hasPlants, readUserData, useAuth} from "../firebaseModel";
import React, {useEffect, useState} from "react";
import PlantView from "../views/PlantView";
import AddPlantView from "../views/AddPlantView";
import addPlantIcon from '../styling/images/plus-pot.png'
import {Link, useNavigate} from "react-router-dom";
import {Plant} from "./Plant";

export default function PlantPresenter() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState(null);
  const {user} = useAuth();
  let hasPlantPromise = hasPlants(user);
  const [hasPlant, setPlantBool] = useState(false);
  hasPlantPromise.then((v) => {
    //console.log(v + " hasPlantPromise");
        setPlantBool(v);
    }).catch(err => console.error(err));

    useEffect(() => {
        if (plants == null) {
            readUserData(user, "plants").then((data => {
                setPlants(data)
            }));
        }
    }, [user])
  /**
   * DummieButton to add a new plant*/
  function buttonHandler() {
    navigate("/addPlant")
    //addNewPlant(user, "plants", "Parasollpilea" ).catch(error => {console.error(error)})
  }
  function renderPlants(){
    let meas = 'measureData', date = new Date(), month = "0", m = date.getMonth();
    if (m < 10) {
      month += `${m + 1}`
    } else {
      month = m + 1
    }
    let today = (`${date.getDate()}-${month}-${date.getFullYear()}`)
    let array = []
    {
      Object.keys(plants).map(name => {
        return array.push(<Plant className={name} key={name} data={plants[name][meas]} today={today} plant={name}/>)
      })
    }
    return (<div>{array}</div>)
  }

  function addPlantButton() {
    return (
      <div className={"addPlant"}>
        <Link to="/addNewPlant">
          {<img src={addPlantIcon}/>}
        </Link>
      </div>)
  }

  return <div>
    {hasPlant && plants ? <PlantView plants={plants} AddPlant={addPlantButton} Plants={renderPlants}/> :
      <AddPlantView buttonHandler={buttonHandler}/>}
  </div>
}
