// src/services/userService.ts
import { db } from '../config/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment,
  setDoc, 
  deleteDoc
} from 'firebase/firestore';

// Añadir un establecimiento a favoritos
export const addToFavorites = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Añadir a la lista de favoritos del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(establishmentId)
    });
    
    // Incrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    
    // Comprobar si existe el campo stats
    const establishmentDoc = await getDoc(establishmentRef);
    if (establishmentDoc.exists() && !establishmentDoc.data().stats) {
      // Si el establecimiento existe pero no tiene stats, inicializarlos
      await updateDoc(establishmentRef, {
        stats: {
          favoriteCount: 1,
          bookmarkCount: 0
        }
      });
    } else {
      // Si ya tiene stats, incrementar el contador
      await updateDoc(establishmentRef, {
        'stats.favoriteCount': increment(1)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

// Eliminar un establecimiento de favoritos
export const removeFromFavorites = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Quitar de la lista de favoritos del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(establishmentId)
    });
    
    // Decrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    
    // Comprobar si existe el campo stats
    const establishmentDoc = await getDoc(establishmentRef);
    if (establishmentDoc.exists() && establishmentDoc.data().stats) {
      await updateDoc(establishmentRef, {
        'stats.favoriteCount': increment(-1)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// Añadir un establecimiento a bookmarks
export const addToBookmarks = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Añadir a la lista de bookmarks del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarks: arrayUnion(establishmentId)
    });
    
    // Incrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    
    // Comprobar si existe el campo stats
    const establishmentDoc = await getDoc(establishmentRef);
    if (establishmentDoc.exists() && !establishmentDoc.data().stats) {
      // Si el establecimiento existe pero no tiene stats, inicializarlos
      await updateDoc(establishmentRef, {
        stats: {
          favoriteCount: 0,
          bookmarkCount: 1
        }
      });
    } else {
      // Si ya tiene stats, incrementar el contador
      await updateDoc(establishmentRef, {
        'stats.bookmarkCount': increment(1)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to bookmarks:', error);
    return false;
  }
};

// Eliminar un establecimiento de bookmarks
export const removeFromBookmarks = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Quitar de la lista de bookmarks del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarks: arrayRemove(establishmentId)
    });
    
    // Decrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    
    // Comprobar si existe el campo stats
    const establishmentDoc = await getDoc(establishmentRef);
    if (establishmentDoc.exists() && establishmentDoc.data().stats) {
      await updateDoc(establishmentRef, {
        'stats.bookmarkCount': increment(-1)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing from bookmarks:', error);
    return false;
  }
};

// Verificar si un establecimiento está en favoritos
export const isInFavorites = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.favorites && userData.favorites.includes(establishmentId);
    }
    return false;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
};

// Verificar si un establecimiento está en bookmarks
export const isInBookmarks = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.bookmarks && userData.bookmarks.includes(establishmentId);
    }
    return false;
  } catch (error) {
    console.error('Error checking bookmarks:', error);
    return false;
  }
};

// Obtener todos los favoritos de un usuario
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.favorites || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

export const updateUserProfile = async (
  userId: string, 
  profileData: { 
    displayName?: string; 
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    profileUpdated?: boolean; // Flag para perfil personalizado
    [key: string]: any;  // Para permitir otros campos
  }
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Crear objeto de actualización
    const updateData: any = {'profile.updatedAt': new Date()};
    
    // Solo incluir campos que se proporcionan
    if (profileData.displayName !== undefined) {
      updateData['profile.displayName'] = profileData.displayName;
    }
    
    if (profileData.firstName !== undefined) {
      updateData['profile.firstName'] = profileData.firstName;
    }
    
    if (profileData.lastName !== undefined) {
      updateData['profile.lastName'] = profileData.lastName;
    }
    
    if (profileData.photoURL !== undefined) {
      updateData['profile.photoURL'] = profileData.photoURL;
    }
    
    if (profileData.profileUpdated !== undefined) {
      updateData['profile.profileUpdated'] = profileData.profileUpdated;
    }
    
    // Agregar otros campos proporcionados
    Object.keys(profileData).forEach(key => {
      if (!['displayName', 'firstName', 'lastName', 'photoURL', 'profileUpdated'].includes(key)) {
        updateData[`profile.${key}`] = profileData[key];
      }
    });
    
    await updateDoc(userRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Obtener perfil de usuario
export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().profile || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Añade estas funciones a tu userService.ts

// Añadir un like a un establecimiento
export const addLike = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Añadir a la lista de likes del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likes: arrayUnion(establishmentId)
    });
    
    // Incrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    await updateDoc(establishmentRef, {
      reviewCount: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error adding like:', error);
    return false;
  }
};

// Eliminar un like de un establecimiento
export const removeLike = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    // Quitar de la lista de likes del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likes: arrayRemove(establishmentId)
    });
    
    // Decrementar contador en el establecimiento
    const establishmentRef = doc(db, 'establishments', establishmentId);
    await updateDoc(establishmentRef, {
      reviewCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error removing like:', error);
    return false;
  }
};

// Obtener todos los likes de un usuario
export const getUserLikes = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.likes || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user likes:', error);
    return [];
  }
};

// Verificar si un establecimiento tiene like del usuario
export const isLiked = async (userId: string, establishmentId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.likes && userData.likes.includes(establishmentId);
    }
    return false;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// En tu userService.js
export const deleteUserProfile = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    console.log('User profile deleted from Firestore');
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};