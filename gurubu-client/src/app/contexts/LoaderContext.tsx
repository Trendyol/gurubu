import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
  } from "react";
  
  const LoaderContext = createContext<any>(null);
  
  interface LoaderProviderProps {
    children: ReactNode;
  }
  
  interface LoaderProviderResponse {
    showLoader: boolean;
    setShowLoader: Function;
  }
  
  export const LoaderProvider = ({ children }: LoaderProviderProps) => {
    const [showLoader, setShowLoader] = useState(false);
  
    return (
      <LoaderContext.Provider value={{ showLoader, setShowLoader }}>
        {children}
      </LoaderContext.Provider>
    );
  };
  
  export const useLoader = (): LoaderProviderResponse => {
    return useContext(LoaderContext);
  };
  