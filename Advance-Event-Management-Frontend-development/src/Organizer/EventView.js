import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EventView = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        registeredEvents: 0,
        bookedEvents: 0
    });
    const token = localStorage.getItem("token");

    // Chart data adapted for react-chartjs-2
    const chartData = {
        labels: ["Total Events", "Registered Events", "Booked Events"],
        datasets: [
            {
                label: "Event Stats",
                data: [stats.totalEvents, stats.registeredEvents, stats.bookedEvents],
                borderColor: "#6F2DA8",
                backgroundColor: "rgba(111, 45, 168, 0.2)",
                fill: true,
                tension: 0.4, // Smooth curve
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: "#6F2DA8",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                    color: "#333",
                },
            },
            title: {
                display: true,
                text: "Event Statistics",
                font: {
                    size: 20,
                    weight: "bold",
                },
                color: "#333",
                padding: {
                    bottom: 20,
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#6F2DA8",
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#555",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#333",
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: "#ddd",
                    borderDash: [3, 3],
                },
            },
        },
        maintainAspectRatio: false, // Allows custom height
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/organizer-stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Stats fetch failed with status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Error fetching organizer stats:", error.message);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    return (
        <div className="container-fluid p-0">
            <div className="row g-0">
                {/* Main Content Area */}
                <div className="col-12 p-4">
                    <h2 className="mb-4 text-center">Events Overview</h2>

                    {/* Stats Cards */}
                    <div className="row mb-4 g-3">
                        <div className="col-md-4">
                            <div 
                                className="card h-100 border-0 shadow-sm text-white" 
                                style={{ backgroundColor: '#6F2DA8', minHeight: '250px' }}
                            >
                                <div className="card-body text-center d-flex flex-column justify-content-center">
                                    <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Total Events</h5>
                                    <p className="card-text display-4" style={{ fontSize: '3.5rem' }}>{stats.totalEvents}</p>
                                    <p className="card-text" style={{ fontSize: '1.1rem' }}>All events you’ve hosted</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div 
                                className="card h-100 border-0 shadow-sm text-white" 
                                style={{ backgroundColor: '#8B5ACF', minHeight: '250px' }}
                            >
                                <div className="card-body text-center d-flex flex-column justify-content-center">
                                    <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Registered Events</h5>
                                    <p className="card-text display-4" style={{ fontSize: '3.5rem' }}>{stats.registeredEvents}</p>
                                    <p className="card-text" style={{ fontSize: '1.1rem' }}>User registrations for your events</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div 
                                className="card h-100 border-0 shadow-sm text-white" 
                                style={{ backgroundColor: '#4B1C7A', minHeight: '250px' }}
                            >
                                <div className="card-body text-center d-flex flex-column justify-content-center">
                                    <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Booked Events</h5>
                                    <p className="card-text display-4" style={{ fontSize: '3.5rem' }}>{stats.bookedEvents}</p>
                                    <p className="card-text" style={{ fontSize: '1.1rem' }}>Events you’ve booked</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Chart Section */}
                    <div className="row g-0">
                        <div className="col-12">
                            <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                                <div className="card-body p-4">
                                    <div style={{ height: '350px' }}> {/* Increased height */}
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventView;