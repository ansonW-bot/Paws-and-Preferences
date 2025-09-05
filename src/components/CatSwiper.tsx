import React, { useState, useEffect, useRef, useMemo } from "react"
import TinderCard from "react-tinder-card"
import type { Cat } from "../interface/Cats";

export default function CatSwiper() {
  const [amtCats] = useState(10);                           // Total amount of cats shown
  const [cats, setCats] = useState<Cat[]>([]);              // Array to store Cat objects
  const [currentIndex, setCurrentIndex] = useState(0);      // Current top card index 
  const [showTutorial, setShowTutorial] = useState(true);   // Show tutorial overlay  
  const [loading, setLoading] = useState(true);             // Loading page to load cat images
  const [likedCats, setLikedCats] = useState<Cat[]>([]);    // Array to store liked Cat objects
  const [showResults, setShowResults] = useState(false);    // Toggle to show results of liked cats after all cats are swipped
  const currentIndexRef = useRef(0);                        // Reference to keep track of current card index
  const [showHeart, setShowHeart] = useState(false);        // Display a heart emoji when a cat is liked 

  /**
   * Fetches cat images from Cataas API, preloads them and initialise the 
   * card stack with the latest index
   */

  useEffect(() => {
    const loadCats = async () => {
      setLoading(true);
      try {
        const newCats = [];
        for (let i = 0; i < amtCats; i++) {
          newCats.push({
            // Generate new cat image
            url: `https://cataas.com/cat?${Date.now()}-${i}`,
          });
        }
        setCats(newCats);
        setCurrentIndex(newCats.length - 1);
        currentIndexRef.current = newCats.length - 1;

        // Wait for the image to complete loading 
        await Promise.all(
          newCats.map((cat) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = cat.url;
            });
          })
        );

      } catch (error) {
        console.error("Error loading cats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCats();
  }, [amtCats]);

  /**
   * Shows the result screen with liked cats after all cards have been swiped
   */
  useEffect(() => {
    if (currentIndex === -1 && cats.length > 0 && !showResults) {
      setShowResults(true);
    }
  }, [currentIndex, cats.length]);

  /**
   * Builds array of refs to not reset every render
   * 
   */
  const childRefs = useMemo(
    () =>
      Array(amtCats)
        .fill(0)
        .map(() => React.createRef<any>()),
    [amtCats]
  );

  /**
   * Updates both state and refs for current index
   * 
   */
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;

  /**
   * Handles swipe events
   * - Updates current inde 
   * - Adds cat image to kied cats if swiped right
   * -  Triggers heart animation when swiped right
   */
  const swiped = (direction: string, catUrl: string, index: number) => {
    updateCurrentIndex(index - 1);
    
    if (direction === "right") {
      const likedCat = cats.find(cat => cat.url === catUrl);
      if (likedCat) {
        setLikedCats(prev => [...prev, likedCat]);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 200);
    }
  };

  /**
   * Restores card if swpied too early
   * 
   */
  const outOfFrame = (idx: number) => {
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current.restoreCard();
    }
  };

  /**
   * Swiping of the card itself
   *  
   */
  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < cats.length) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  /**
   * Triggers when "More cats" button is pressed
   * Clears liked cats, fetches new cats, preloads images and reset the card stack
   */
 const loadNewCats = async () => {
  setLikedCats([]);
  setLoading(true);

  try {
    const newCats = [];
    for (let i = 0; i < amtCats; i++) {
      newCats.push({
        url: `https://cataas.com/cat?${Date.now()}-${i}`,
      });
    }

    await Promise.all(
      newCats.map(
        (cat) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = cat.url;
          })
      )
    );
    setCats(newCats);
    setShowResults(false)

    setCurrentIndex(newCats.length - 1);
    currentIndexRef.current = newCats.length - 1;

  } catch (error) {
    console.error("Error loading new cats:", error);
  } finally {
    setLoading(false);
  }
};


  // Loading screen 
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <div className="text-center">
          <div className="text-6xl animate-spin">🧶</div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">Loading Cats...</h2>
        </div>
      </div>
    );
  }

  // Results screen - show liked cats
  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-pink-100 to-blue-100 p-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
          {likedCats.length > 0 ? "Your Purr-fect Matches! 🐾" : "No matches yet 😿"}
        </h1>
        
        {likedCats.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-4xl mx-auto">
              {likedCats.map((cat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
                  <img
                    src={cat.url}
                    alt={`Liked cat ${index + 1}`}
                    className="w-full h-32 sm:h-40 md:h-48 object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-lg sm:text-xl mb-6 text-gray-700">
  You liked <span className="font-bold text-pink-600">{likedCats.length}</span> out of 
  <span className="font-bold  text-pink-600"> {cats.length}</span> cats!
</p>
          </>
        ) : (
          <p className="text-lg sm:text-xl mb-6 text-gray-700 text-center">
            No cats here. Give it another try!
          </p>
        )}
        
        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={loadNewCats}
            className="bg-green-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-lg hover:bg-green-600 transition text-lg font-semibold text-white"
          >
            More Cats!!! 😻
          </button>
        </div>
      </div>
    );
  }

  // Main Game screem
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-pink-100 to-blue-100 p-4">
     <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-pink-600 drop-shadow-md tracking-wide font-[Comic Sans MS]">
  🐱 Swipe the Cats 🐾
</h1>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] overflow-hidden">
        {cats.map((cat, index) => {
          const offset = cats.length - index - 1;
          const scaleFactor = 1 - offset * 0.02;
          const translateY = offset * 2;
          
          return (
            <TinderCard
  ref={childRefs[index]}
  className="absolute w-full h-full select-none touch-none"
  key={cat.url}
  onSwipe={(dir) => swiped(dir, cat.url, index)}
  onCardLeftScreen={() => outOfFrame(index)}
  preventSwipe={["up", "down"]}
  flickOnSwipe={true}
  swipeRequirementType="position"
  swipeThreshold={20}
>
  <div
    className={`bg-white rounded-2xl shadow-lg w-full h-full flex items-center justify-center transition-transform duration-300 select-none touch-none`}
    style={{
      transform: `translateY(${translateY}px) scale(${scaleFactor})`,
      zIndex: index,
    }}
  >
    <img
      src={cat.url}
      alt={`Cat ${index + 1}`}
      className="w-full h-full object-cover rounded-2xl pointer-events-none select-none touch-none"
      draggable="false"
    />

    
  </div>
</TinderCard>
          );
        })}
      </div>

      {/* Control buttons */}
      <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-5 md:mt-6">
        <button
          onClick={() => swipe("left")}
          disabled={!canSwipe}
          className={`px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-lg shadow text-base sm:text-lg md:text-xl font-semibold ${
            canSwipe 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          👎
        </button>
        <button
          onClick={() => swipe("right")}
          disabled={!canSwipe}
          className={`px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-lg shadow text-base sm:text-lg md:text-xl font-semibold ${
            canSwipe 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          ❤️
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 text-gray-600">
        {currentIndex + 1} / {cats.length}
      </div>

      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center text-gray-800 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">How to Play</h2>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <p className="text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">➡</span>
                <span className="font-semibold">Swipe Right</span> to Like
              </p>
              <p className="text-lg sm:text-xl md:text-2xl flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">⬅</span>
                <span className="font-semibold">Swipe Left</span> to Dislike
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-4">
                See your matches at the end!
              </p>
            </div>
            <button
              onClick={() => setShowTutorial(false)}
              className="bg-blue-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-lg hover:bg-blue-600 transition text-lg sm:text-xl font-semibold text-white w-full"
            >
              Got it! Let's Play 🐾
            </button>
          </div>
        </div>
      )}

      {showHeart && (
  <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
    <span className="text-red-500 text-[6rem] sm:text-[8rem] opacity-100 animate-fade-heart">
      ❤️
    </span>
  </div>
)}

      
    </div>
  );
}