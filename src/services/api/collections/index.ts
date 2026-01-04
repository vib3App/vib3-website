import { playlistsApi } from './playlists';
import { savedApi } from './saved';

export const collectionsApi = {
  // Playlists
  getCollections: playlistsApi.getCollections,
  getCollection: playlistsApi.getCollection,
  getCollectionVideos: playlistsApi.getCollectionVideos,
  createPlaylist: playlistsApi.createPlaylist,
  updatePlaylist: playlistsApi.updatePlaylist,
  deletePlaylist: playlistsApi.deletePlaylist,
  addToCollection: playlistsApi.addToCollection,
  removeFromCollection: playlistsApi.removeFromCollection,
  reorderVideos: playlistsApi.reorderVideos,
  getVideoPlaylists: playlistsApi.getVideoPlaylists,
  addToPlaylists: playlistsApi.addToPlaylists,

  // Watch Later
  getWatchLater: savedApi.getWatchLater,
  addToWatchLater: savedApi.addToWatchLater,
  removeFromWatchLater: savedApi.removeFromWatchLater,
  isInWatchLater: savedApi.isInWatchLater,

  // Saved Videos
  getSavedVideos: savedApi.getSavedVideos,
  saveVideo: savedApi.saveVideo,
  unsaveVideo: savedApi.unsaveVideo,
  isVideoSaved: savedApi.isVideoSaved,

  // Liked Videos
  getLikedVideos: savedApi.getLikedVideos,

  // Watch History
  getWatchHistory: savedApi.getWatchHistory,
  clearWatchHistory: savedApi.clearWatchHistory,
  removeFromHistory: savedApi.removeFromHistory,
};
