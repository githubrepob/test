// src/components/dashboard/StatCard.jsx

import React from "react";
import "./dashboard.css";

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default StatCard;