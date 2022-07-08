import React from "react";

const Navigation = (props) => {
  if (props.isSignedIn) {
    return (
      <div>
        <nav style={{ display: "flex", justifyContent: "flex-end" }}>
          <p
            onClick={() => props.onRouteChange("signout")}
            className="f3 link dim black underline pa3 pointer"
          >
            Sign Out
          </p>
        </nav>
      </div>
    );
  } else {
    return (
        <nav style={{ display: "flex", justifyContent: "flex-end" }} >
          <p
            onClick={() => props.onRouteChange("signin")}
            className="f3 link dim black underline pa3 pointer"
          >
            Sign In
          </p>
          <p
            onClick={() => props.onRouteChange("register")}
            className="f3 link dim black underline pa3 pointer"
          >
            Register
          </p>
        </nav>
    );
  }
};

export default Navigation;
