import {readUserData, removePlant, setWateredTrue, useAuth} from "../firebaseModel";
import React, {useEffect, useState} from "react";
import PlantView from "../views/PlantView";
import {Link} from "react-router-dom";
import elephant from "../styling/images/elefant.jpg";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faCloud,
  faCloudSun,
  faExclamationCircle,
  faSliders,
  faSun,
  faThermometerHalf,
  faTint,
  faTrashAlt,
  faWater
} from '@fortawesome/free-solid-svg-icons';
import Modal from "../views/Modal";

/*TODO: Check why sometimes getting an uncaught error */
export default function PlantPresenter() {
  const [plants, setPlants] = useState(null);
  const {user} = useAuth();
  useEffect(() => {

    if (plants === null) {
      fetchData().catch(err => console.error(err.message));
    }

    async function fetchData() {
      await readUserData(user, "plants").then((data => {
        setPlants(data)
      })).catch(err => console.error(err.message));
    }
  }, [user, plants])

  function Plant({name, data, watering, sunlight, productID}) {
    const [expanded, setExpanded] = useState(false);
    const [latest, setLatest] = useState({})
    const [connected, setConnected] = useState(false)
    const [isWatering, setIsWatering] = useState(false);
    const [lightOptions, setOptions] = useState([])
    const {user} = useAuth()

    function handleWaterClick() {
      setWateredTrue(name);
      setIsWatering(true);
      setTimeout(() => {
        setIsWatering(false)
      }, 2000)
    }

    function handleClick(e) {
      e.preventDefault()
      setExpanded(prevState => !prevState);

    }

    useEffect(() => {
      let latestDate = Object.keys(data).map((x) =>
        parseInt(x)).reduce((a, b) => Math.max(a, b))
      let latest = data[latestDate]
      setLatest(data[latestDate])
      setOptions(weatherIcon(latest.uvIntensity))
      if (productID !== 'RaspberryPi') {
        setConnected(true)
      }
    }, [user, data, productID])

    function getMoistureColor(actual, wateringPreset) {
      const lowerLimit = wateringPreset.min;
      const upperLimit = wateringPreset.max;

      return (actual >= lowerLimit && actual <= upperLimit) ? 'green' : 'red';
    }

    function getTemperatureColor(temperature) {
      return (temperature >= 10 && temperature <= 30) ? 'green' : 'red';
    }

    function wateringToValue(watering) {
      //The plan is to trigger the automatic watering system based on the minimum value.
      switch (watering) {
        case 'Frequent':
          return {min: 60, max: 90};
        case 'Average':
          return {min: 30, max: 60};
        case 'Minimum':
          return {min: 15, max: 30};
        case 'None':
          return {min: 0, max: 15};
        //Default values in case a plant has no watering information.
        default:
          return {min: 30, max: 60};
      }
    }

    function sunlightToValue(sunlight) {
      const mapping = {
        'Full shade': {min: 0.1, max: 0.4},
        'Part shade': {min: 0.4, max: 0.7},
        'Full sun': {min: 0.7, max: 1.0},
      };
      //Default values in case a plant has no sunlight information.
      let min = 0.3;
      let max = 0.8;

      if (Array.isArray(sunlight)) {
        const values = sunlight.filter((value) => mapping.hasOwnProperty(value));
        if (values.length > 0) {
          min = Math.min(...values.map((value) => mapping[value].min));
          max = Math.max(...values.map((value) => mapping[value].max));
        }
      }
      return {min, max};
    }

    let wateringValue = wateringToValue(watering);
    let sunlightValue = sunlightToValue(sunlight);
    let image = plants[name].plantRecommendedVitals.image;
    if (!image || image === "NaN") {
      image = elephant
    }
    const weatherIcon = (sunlight) => {
      if (sunlight < 0.4) {
        return (
          [faCloud, {color: 'black'}]
        )
      }
      if (sunlight >= 0.4 && sunlight < 0.7) {
        return (
          [faCloudSun, {color: 'grey'}]
        )
      } else {
        return (
          [faSun, {color: 'yellow'}]
        )
      }
    }
    return (
      <>
        {connected ?
          <div id={name} className={`expandable-div ${expanded && connected ? "expanded" : ""}`}
               onClick={handleClick}>
            <div className="card-title">
              <img src={image} width="100" height="100"
                   alt={"Oh no your plant picture is gone"}/>
              <span style={{padding: "0.5em", textTransform: 'capitalize'}}>{name}</span>
            </div>
            <div className="plant-data">
              <div className="row">
                <div className="col">
                  <div className="circle"
                       style={{color: getMoistureColor(latest.soilMoisture, wateringValue)}}>{latest.soilMoisture}{'%'}</div>
                  <p><FontAwesomeIcon icon={faTint} style={{color: 'saddlebrown'}}
                                      title={`${watering} ${wateringValue.min}% - ${wateringValue.max}%`}/> Moisture</p>
                </div>
                <div className="col">
                  <div className="circle"
                  >
                    <FontAwesomeIcon icon={lightOptions.at(0)}
                                     style={{color: (latest.uvIntensity >= sunlightValue.min && latest.uvIntensity <= sunlightValue.max) ? 'green' : 'red'}}
                                     size='2xl'
                                     title={(latest.uvIntensity >= sunlightValue.min && latest.uvIntensity <= sunlightValue.max) ? `Light in optimal range: ${latest.uvIntensity}` : `Light outside optimal range: ${latest.uvIntensity}`}/>
                  </div>
                  <p
                    title={`${sunlight.join(', ') + ' [' + sunlightValue.max + ', ' + sunlightValue.min + ']'}`}>
                    <FontAwesomeIcon icon={weatherIcon(sunlightValue.max).at(0)}
                                     style={weatherIcon(sunlightValue.max).at(1)}
                    />
                    <FontAwesomeIcon icon={weatherIcon(sunlightValue.min).at(0)}
                                     style={weatherIcon(sunlightValue.min).at(1)}
                    />
                    Light
                  </p>
                </div>
                <div className="col">
                  <div className="circle"
                       style={{color: getTemperatureColor(latest.temperature)}}>{latest.temperature}{"\u00B0" + "C"}</div>
                  <p><FontAwesomeIcon icon={faThermometerHalf} title={'Optimal 10\u00B0C - 30\u00B0C'}/> Temperature
                  </p>
                </div>
                <div className="col">
                  <div className="circle"
                       style={(latest.waterLevel) ? {color: 'green'} : {color: 'red'}}><FontAwesomeIcon
                    icon={latest.waterLevel ? faWater : faExclamationCircle} size='2xl'
                    title={latest.waterLevel ? 'Full' : 'Refill water tank'}/>
                  </div>
                  <p><FontAwesomeIcon icon={faWater} style={{color: 'blue'}}/> Waterlevel</p>
                </div>
              </div>
              <button id="trash" className={"icon--small"} type={"button"} onClick={(event) => removePlant(name)}>
                {<FontAwesomeIcon icon={faTrashAlt} size='xl' title='Delete plant' style={{color: 'black'}}/>}</button>
              <div id="icons__row" className="row">
                <Link to={`/history/${name}`} state={data} id="graph" className={"icon--small"}>{<FontAwesomeIcon
                  icon={faChartLine} style={{color: 'black'}} size='xl' title={'History'}/>}</Link>

                <button id="waterdrop" className={"icon--small"} type={"button"}
                        onClick={handleWaterClick}>{<FontAwesomeIcon icon={faTint} style={{color: 'black'}}
                                                                     title='Water your plant'
                                                                     size='xl'/>}
                </button>
                <div id="settings-icon" className="icon--small"><Link to={`/settings/${name}`} state={plants}>
                  <FontAwesomeIcon icon={faSliders} size='xl' title='Settings' style={{color: 'black'}}/>
                </Link></div>
              </div>
            </div>
          </div> :
          <div id={name} className={`expandable-div ""`}>
            <div className="card-title">
              <img src={image} width="100" height="100"
                   alt={"Oh no your plant picture is gone"}/>
              <span style={{padding: "0.5em", textTransform: 'capitalize'}}>
                <Link className='expandable-div' to='/connect' state={{plantName: name}}>
                  Connect {name} to PotBot</Link><p/>
                <button className='connect' type={"button"}
                        onClick={(event) =>
                          removePlant(name)}>Not right plant? Delete plant
                  </button>
              </span>

            </div>
          </div>}
        <Modal active={isWatering} message={"Your plant is being watered!"}/>
      </>)


  }


  return <PlantView user={user} plants={plants} Plant={Plant}/>
}
