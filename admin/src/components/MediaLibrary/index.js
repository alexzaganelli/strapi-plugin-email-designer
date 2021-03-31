import React, { useEffect, useState } from 'react';
import { useStrapi, prefixFileUrlWithBackendUrl } from 'strapi-helper-plugin';
 
const MediaLibrary = ({ isOpen, onChange, onToggle }) => {
 const {
   strapi: {
     componentApi: { getComponent },
   },
 } = useStrapi();
 const [data, setData] = useState(null);
 const [isDisplayed, setIsDisplayed] = useState(false);
 
 useEffect(() => {
   if (isOpen) {
     setIsDisplayed(true);
   }
 }, [isOpen]);
 
 const Component = getComponent('media-library').Component;
 
 const handleInputChange = data => {
   if (data) {
     const { url } = data;
 
     setData({ ...data, url: prefixFileUrlWithBackendUrl(url) });
   }
 };
 
 const handleClosed = () => {
   if (data) {
     onChange(data);
   }
 
   setData(null);
   setIsDisplayed(false);
 };
 
 if (Component && isDisplayed) {
   return (
     <Component
       allowedTypes={['images', 'videos', 'files']}
       isOpen={isOpen}
       multiple={false}
       noNavigation
       onClosed={handleClosed}
       onInputMediaChange={handleInputChange}
       onToggle={onToggle}
     />
   );
 }
 
 return null;
};
 
export default MediaLibrary;