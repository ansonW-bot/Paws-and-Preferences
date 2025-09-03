import React, { useState, useEffect, useRef, useMemo } from "react"
import TinderCard from "react-tinder-card"
import type { Cat } from "../interface/Cats";

export default function CatSwiper() {
  const [amtCats, setAmtCats] = useState(10);
  const [cats, setCats] = useState<Cat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const loadCats = () => {
      const newCats = [];
      for (let i = 0; i < amtCats; i++) {
        newCats.push({
          url: `https://cataas.com/cat?${Date.now()}-${i}`,
        });
      }
      setCats(newCats);
      setCurrentIndex(newCats.length - 1);
      currentIndexRef.current = newCats.length - 1;
    };
    loadCats();
  }, [amtCats]);

  const childRefs = useMemo(
    () =>
      Array(amtCats)
        .fill(0)
        .map(() => React.createRef<any>()),
    [amtCats]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;

  const swiped = (direction: string, catUrl: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
    console.log(direction === "right" ? `Liked ${catUrl}` : `Disliked ${catUrl}`);
  };

  const outOfFrame = (idx: number) => {
    console.log(`${idx} left the screen`);
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current.restoreCard();
    }
  };

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < cats.length) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 relative">
      <h1 className="text-2xl font-bold mb-6">Swipe the Cats</h1>

      {/* Card Stack */}
      <div className="relative w-80 h-[400px]">
        {cats.map((cat, index) => {
          const offset = cats.length - index - 1; // lower index = deeper in stack
          return (
            <TinderCard
              ref={childRefs[index]}
              className="absolute w-full h-full select-none"
              key={cat.url}
              onSwipe={(dir) => swiped(dir, cat.url, index)}
              onCardLeftScreen={() => outOfFrame(index)}
              preventSwipe={["up", "down"]}
              flickOnSwipe={true}                // <-- enable auto-flick
              swipeRequirementType="velocity"    // <-- base swipe on distance, not velocity
              swipeThreshold={0.2}   
            >
              <div
                className={`bg-white rounded-2xl shadow-lg w-full h-full flex items-center justify-center transition-transform duration-300`}
                style={{
                  transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.02})`,
                  zIndex: index,
                }}
              >
                <img
                  src={cat.url}
                  alt={`Cat ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </TinderCard>
          );
        })}
      </div>

      {/* Control buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => swipe("left")}
          disabled={!canSwipe}
          className={`px-4 py-2 rounded-lg shadow ${
            canSwipe ? "bg-red-500 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          Dislike 👎
        </button>
        <button
          onClick={() => swipe("right")}
          disabled={!canSwipe}
          className={`px-4 py-2 rounded-lg shadow ${
            canSwipe ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          Like ❤️
        </button>
      </div>

      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          <p className="mb-2">➡ <span className="font-bold">Swipe Right</span> to Like</p>
          <p className="mb-6">⬅ <span className="font-bold">Swipe Left</span> to Dislike</p>
          <button
            onClick={() => setShowTutorial(false)}
            className="bg-blue-500 px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}
