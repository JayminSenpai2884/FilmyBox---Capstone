import React, { useEffect, useState } from "react";
import axios from "axios";
import YouTube from 'react-youtube';
import { FaRandom } from "react-icons/fa";

interface TVSeries {
  id: number;
  name: string;
  poster_path: string;
  first_air_date: string;
  overview: string;
}

interface Video {
  id: string;
  key: string;
}

const TVSeriesDB = () => {
  const [series, setSeries] = useState<TVSeries[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<TVSeries | null>(null);
  const apiKey = "f0b5c1d3307aae122961663d10864986";
  const popularSeries = "https://api.themoviedb.org/3/tv/popular";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${popularSeries}?api_key=${apiKey}`);
        const result = response.data.results;
        setSeries(result);
        await getVid(result);
      } catch (error) {
        console.error("Error fetching TV series:", error);
      }
    };

    const getVid = async (series: TVSeries[]) => {
      const videoPromises = series.map(async (series) => {
        try {
          const response = await axios.get(`https://api.themoviedb.org/3/tv/${series.id}/videos?api_key=${apiKey}&language=en-US`);
          const videoData = response.data.results;
          if (videoData.length > 0) {
            return {
              id: series.id.toString(),
              key: videoData[0].key
            };
          }
          return null;
        } catch (error) {
          console.error("Error fetching video for TV series ID:", series.id, error);
          return null;
        }
      });
      const videoResults = await Promise.all(videoPromises);
      setVideos(videoResults.filter(video => video !== null) as Video[]);
    };

    fetchData();
  }, [apiKey, popularSeries]);

  const openVideoPopup = (series: TVSeries) => {
    setSelectedSeries(series);
  };

  const closeVideoPopup = () => {
    setSelectedSeries(null);
  };

  const openRandomSeries = () => {
    const randomIndex = Math.floor(Math.random() * series.length);
    const randomSeries = series[randomIndex];
    openVideoPopup(randomSeries);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <br></br>
      <h1 className="text-3xl font-semibold mb-8 mt-2 text-white flex items-center">Popular TV Series
      <button
        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full shadow-lg transition-all duration-300 group cursor-pointer outline-none hover:rotate-90 "
        onClick={openRandomSeries}
        title="Click me!!"
      >
        <FaRandom className="text-white stroke-blue-400  group-hover:fill-grey-800 group-active:stroke-blue-200 group-active:fill-white group-active:duration-0 duration-300" />
      </button>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {series.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-lg shadow-lg">
            <img
              className="w-full h-auto object-cover transition-transform duration-300 transform scale-100 hover:scale-105 rounded-t-lg cursor-pointer"
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={`${item.name} Poster`}
              onClick={() => openVideoPopup(item)}
            />
            {selectedSeries && selectedSeries.id === item.id && (
              <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50" onClick={closeVideoPopup}>
                <div className="p-8 bg-white rounded-lg overflow-hidden shadow-lg max-w-3xl">
                  <h2 className="text-3xl font-semibold mb-4">{selectedSeries.name}</h2>
                  <p className="text-lg mb-4">{selectedSeries.overview}</p>
                  <p className="text-base">First Air Date: {selectedSeries.first_air_date}</p>
                  <br></br>
                  <div> 
                  {videos.find(video => video.id === selectedSeries.id.toString()) && (
                    <YouTube style={{
                        width: '644px',
                        height: '367px', 
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }} videoId={videos.find(video => video.id === selectedSeries.id.toString())!.key}></YouTube>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVSeriesDB;
