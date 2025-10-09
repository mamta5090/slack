// import { useEffect } from 'react';

// function useClickOutside(ref, handler) {
//   useEffect(() => {
//     const listener = (event) => {
//       // Do nothing if clicking ref's element or descendent elements
//       if (!ref.current || ref.current.contains(event.target)) {
//         return;
//       }
//       handler(event);
//     };

//     // Add event listeners for both mouse and touch events
//     document.addEventListener('mousedown', listener);
//     document.addEventListener('touchstart', listener);

//     // Cleanup function to remove event listeners
//     return () => {
//       document.removeEventListener('mousedown', listener);
//       document.removeEventListener('touchstart', listener);
//     };
//   }, [ref, handler]); // Re-run effect only if ref or handler changes
// }

// export default useClickOutside;