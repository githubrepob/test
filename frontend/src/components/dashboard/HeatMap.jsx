// src/components/dashboard/Heatmap.jsx

import React from "react";
import "./dashboard.css";

const Heatmap = () => {
  const days = Array.from({ length: 120 }, () =>
    Math.floor(Math.random() * 5)
  );

  return (
    <div className="heatmap">
      {days.map((value, index) => (
        <div
          key={index}
          className={`heat-cell level-${value}`}
        ></div>
      ))}
    </div>
  );
};

export default Heatmap;