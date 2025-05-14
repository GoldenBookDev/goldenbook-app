import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // Actualiza esta ruta

// Interfaces
export interface Location {
  id: string;
  name: string;
  image: string;
  imageVersions?: {
    thumbnail: string;  // 300x300 (~20-35 KB)
    medium: string;     // 800px (~100-170 KB)  
    original: string;   // 1200px max (~250-415 KB)
  };
  country?: string;
  featured?: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  mainImage: string;
  gallery: string[];
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  reservationLink: string;
  openingHours: any;
  categories: string[];
  subcategories: string[]; // Añadir esta línea
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Funciones para locations
export const getLocations = async (): Promise<Location[]> => {
  try {
    const locationsRef = collection(db, 'locations');
    const q = query(locationsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      image: doc.data().image,
      country: doc.data().country,
      featured: doc.data().featured,
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const getLocationById = async (locationId: string): Promise<Location | null> => {
  try {
    const locationRef = doc(db, 'locations', locationId);
    const locationSnapshot = await getDoc(locationRef);
    
    if (locationSnapshot.exists()) {
      return {
        id: locationSnapshot.id,
        name: locationSnapshot.data().name,
        image: locationSnapshot.data().image,
        country: locationSnapshot.data().country,
        featured: locationSnapshot.data().featured,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching location with ID ${locationId}:`, error);
    throw error;
  }
};

// Funciones para establishments
export const getEstablishments = async (cityId: string, categoryId?: string): Promise<Establishment[]> => {
  try {
    const establishmentsRef = collection(db, 'establishments');
    // Consulta simple: solo filtrar por ciudad
    const q = query(
      establishmentsRef, 
      where('city', '==', cityId)
    );
    
    const querySnapshot = await getDocs(q);
    
    let establishments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Establishment));
    
    // Si hay un categoryId, filtramos en el cliente
    if (categoryId) {
      establishments = establishments.filter(est => 
        est.categories && est.categories.includes(categoryId)
      );
    }
    
    // Ordenar por rating en el cliente
    return establishments.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Error fetching establishments:', error);
    throw error;
  }
};

export const getFeaturedEstablishments = async (cityId: string): Promise<Establishment[]> => {
  try {
    const establishmentsRef = collection(db, 'establishments');
    // Consulta simple: solo filtrar por ciudad
    const q = query(
      establishmentsRef, 
      where('city', '==', cityId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filtrar, ordenar y limitar en el cliente
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Establishment))
      .filter(est => est.featured === true)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching featured establishments:', error);
    throw error;
  }
};

export const getTrendingEstablishments = async (cityId: string): Promise<Establishment[]> => {
  try {
    const establishmentsRef = collection(db, 'establishments');
    // Consulta simple: solo filtrar por ciudad
    const q = query(
      establishmentsRef, 
      where('city', '==', cityId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filtrar, ordenar y limitar en el cliente
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Establishment))
      .filter(est => est.trending === true)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching trending establishments:', error);
    throw error;
  }
};

export const getEstablishmentById = async (establishmentId: string): Promise<Establishment | null> => {
  try {
    const establishmentRef = doc(db, 'establishments', establishmentId);
    const establishmentSnapshot = await getDoc(establishmentRef);
    
    if (establishmentSnapshot.exists()) {
      return {
        id: establishmentSnapshot.id,
        ...establishmentSnapshot.data()
      } as Establishment;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching establishment with ID ${establishmentId}:`, error);
    throw error;
  }
};

// Funciones para categories
export const getCategories = async (): Promise<any[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
};

export const getCategoryById = async (categoryId: string): Promise<any> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnapshot = await getDoc(categoryRef);
    
    if (categorySnapshot.exists()) {
      return {
        id: categorySnapshot.id,
        ...categorySnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching category with ID ${categoryId}:`, error);
    throw error;
  }
};