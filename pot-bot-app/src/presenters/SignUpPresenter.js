import React, {useState} from 'react';
import SignUpView from "../views/SignUpView";
import HomePresenter from "./HomePresenter";
import {useAuth} from "../firebaseModel";
import {useNavigate} from "react-router-dom";

function SignUpPresenter() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const {user, signUp, currentUser} = useAuth();
  let navigate = useNavigate("/home");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(username, password);
    } catch (err) {
      setError(err);
      //console.log(err);
    }
    if (currentUser != null) {
      navigate("/home");
    }
  };

  return (
    <>
      {!user && (
        <SignUpView
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          error={error}
          handleSubmit={handleSubmit}
        />
      )}
      {user && <HomePresenter/>}
    </>
  );
}

export default SignUpPresenter;