import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import {
  subscribeProperties,
  syncPropertiesFromCloud,
} from "./content/propertiesContent";
import { appRouter } from "./router";

function App() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeProperties(() => {
      setVersion((current) => current + 1);
    });
    syncPropertiesFromCloud();
    return unsubscribe;
  }, []);

  return <RouterProvider router={appRouter} />;
}

export default App;
