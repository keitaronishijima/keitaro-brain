import Navigation from "./components/Navigation/Navigation";
import Register from "./components/Register/Register";
import Signin from "./components/Signin/Signin";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "./App.css";
import { useState } from "react";
import React from "react";

const Clarifai = require("clarifai");

const app = new Clarifai.App({
  apiKey: "b29547c98f11475abe71980b99a295a7",
});

const USER_ID = "18e6vw1u0kyk";
// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = "94812ce612e74730888a39db0e3dea7f";
const APP_ID = "4ecb6e3130fc47778454aa7603671e53";
const MODEL_ID = "face-detection";
const MODEL_VERSION_ID = "45fb9a671625463fa646c3523a3087d5";
// Change this to whatever image URL you want to process
const IMAGE_URL = "";

const initialState = {
  id: "",
  name: "",
  email: "",
  entries: 0,
  joined: ""
}

function App() {
  const particlesInit = async (main) => {
    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
  };

  const [input, setInput] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [box, setBox] = useState({});

  const [route, setRoute] = useState("signin");

  const [isSignedIn, setIsSignedIn] = useState(false);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  });

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    });
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      setIsSignedIn(false);
      setImageUrl('');
      setBox('');
    } else if (route === "home") {
      setIsSignedIn(true);
    }
    setRoute(route);
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };
  const displayFaceBox = (box) => {
    setBox(box);
  };

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: input,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const onButtonSubmit = () => {
    setImageUrl(input);
    fetch(
      "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
      requestOptions
    )
      .then((response) => response.json())
      // .then((result) =>
      //   console.log(result.outputs[0].data.regions[0].region_info.bounding_box)
      // )
      .then((result) => {
        if (result) {
          fetch("https://thawing-eyrie-74243.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              setUser((prevState) => ({
                ...prevState,
                entries: count,
              }));
            })
            .catch(console.log)
        }
        displayFaceBox(calculateFaceLocation(result));
      })
      .catch((error) => console.log("error", error));
  };
  //https://samples.clarifai.com/metro-north.jpg
  //result.outputs[0].data.regions.region_info.bounding_box

  return (
    <div className="App">
      <Particles
        className="particles"
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 6,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <Navigation
        isSignedIn={isSignedIn}
        onRouteChange={onRouteChange}
      ></Navigation>
      {route === "signin" ? (
        <Signin loadUser={loadUser} onRouteChange={onRouteChange}></Signin>
      ) : route === "home" ? (
        <div>
          <Logo></Logo> <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          ></ImageLinkForm>
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      ) : (
        <Register loadUser={loadUser} onRouteChange={onRouteChange}></Register>
      )}
    </div>
  );
}
export default App;
